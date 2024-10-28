import { FC, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import moment from "moment";
import { addDoc, collection } from "firebase/firestore";
import { useAuth, useFirestore } from "reactfire";

import { getMockSenderEnhancer } from "@rpldy/mock-sender";
import withPasteUpload from "@rpldy/upload-paste";
import UploadPreview from "@rpldy/upload-preview";
import Uploady, {
  useItemStartListener,
  useItemFinalizeListener,
} from "@rpldy/uploady";
import { ScrollArea } from "./ui/scroll-area";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";

const mockSenderEnhancer = getMockSenderEnhancer();
const PasteInput = withPasteUpload(Input);

interface ModalCreateEventProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  time: number;
  startTime: string;
  setStartTime: (date: string) => void;
  endTime: string;
  setEndTime: (date: string) => void;
}

const UploadStatus = ({
  setImgURL,
  setImgUploadLoading,
}: {
  setImgURL: (url: string) => void;
  setImgUploadLoading: (bool: boolean) => void;
}) => {
  const [status, setStatus] = useState<null | string>(null);
  const storage = getStorage();
  const fileName = new Date().toJSON();
  const storageRef = ref(storage, fileName);

  useItemStartListener(() => {});
  useItemFinalizeListener((e) => {
    setImgUploadLoading(true);
    uploadBytes(storageRef, e.file as File).then(async (snapshot) => {
      const url = await getDownloadURL(snapshot.ref);
      setImgURL(url);
    });
    setImgUploadLoading(false);
  });

  return status;
};

export const ModalCreateEvent: FC<ModalCreateEventProps> = ({
  isOpen,
  setIsOpen,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
}) => {
  const auth = useAuth();
  const firestore = useFirestore();

  const [imgUploadLoading, setImgUploadLoading] = useState(false);
  const [imgURL, setImgURL] = useState("");
  const [title, setTitle] = useState("");
  const resetFields = () => {
    setTitle("");
    setStartTime(moment().format("yyyy-MM-DD HH:mm"));
    setEndTime(moment().format("yyyy-MM-DD HH:mm"));
  };
  const durationSeconds = moment
    .duration(moment(endTime).diff(startTime))
    .asMilliseconds();

  const onSubmit = async () => {
    await addDoc(collection(firestore, "schedule"), {
      id: Date.now(),
      title,
      start: startTime,
      end: endTime,
      time: durationSeconds,
      img: imgURL,
    });
    toast({ title: "성공적으로 저장되었습니다." });
    setIsOpen(false);
    resetFields();
  };

  const handleChange = (setTime: (date: string) => void) => (ev: any) => {
    if (!ev.target["validity"].valid) return;
    const dt = ev.target["value"] + ":00Z";
    setTime(dt.toString().substring(0, 16));
  };

  const totalHour = moment.utc(durationSeconds).format("HH");
  const totalMinute = moment.utc(durationSeconds).add(1, "minute").format("mm");
  const totalTime = `${Number(totalHour) ? `${Number(totalHour)}시간` : ""} ${
    Number(totalMinute) ? `${Number(totalMinute)}분 ` : ""
  }`;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <Uploady debug enhancer={mockSenderEnhancer}>
            <ScrollArea className="max-h-[88vh]">
              <DialogHeader>
                <DialogTitle>등록</DialogTitle>
                <DialogDescription>
                  {/* Enter your email to reset your password */}
                </DialogDescription>
              </DialogHeader>

              <div className="m-1">
                <div className="flex items-center gap-3 mb-3">
                  <div>
                    <Label htmlFor="startDate">시작 일</Label>
                    <Input
                      value={startTime}
                      onChange={handleChange(setStartTime)}
                      name="startDate"
                      type="datetime-local"
                      required
                      disabled={
                        !auth.currentUser?.email?.startsWith("shimwoan@")
                      }
                      className="border-none p-0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="startDate">종료 일</Label>
                    <Input
                      value={endTime}
                      onChange={handleChange(setEndTime)}
                      disabled={
                        !auth.currentUser?.email?.startsWith("shimwoan@")
                      }
                      name="endDate"
                      type="datetime-local"
                      className="border-none p-0"
                      required
                    />
                  </div>
                </div>
                <p className="mb-auto">총 시간: {totalTime}</p>

                <Label htmlFor="title" className="mt-5">
                  제목
                </Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  name="title"
                  placeholder="제목을 입력하세요."
                  type="text"
                  onKeyDown={(e: React.KeyboardEvent) => {
                    if (e.key === "Enter") {
                      onSubmit();
                    }
                  }}
                  required
                />

                <Label htmlFor="img" className="mt-5">
                  이미지
                </Label>
                <PasteInput
                  extraProps={{
                    name: "img",
                    placeholder: "파일을 업로드하세요. (붙여넣기)",
                  }}
                />
                <UploadStatus
                  setImgURL={setImgURL}
                  setImgUploadLoading={setImgUploadLoading}
                />
                <div>
                  <UploadPreview />
                </div>
              </div>

              <Button
                disabled={imgUploadLoading}
                onClick={() => onSubmit()}
                className="mt-8"
              >
                등록
              </Button>
            </ScrollArea>
          </Uploady>
        </DialogContent>
      </Dialog>
    </>
  );
};
