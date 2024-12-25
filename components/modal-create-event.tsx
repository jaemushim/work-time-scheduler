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
}) => {
  const auth = useAuth();
  const firestore = useFirestore();

  const [imgUploadLoading, setImgUploadLoading] = useState(false);
  const [imgURL, setImgURL] = useState("");
  const [title, setTitle] = useState("");
  const resetFields = () => {
    setTitle("");
    setStartTime(moment().format("yyyy-MM-DD"));
  };
  const [hour, setHour] = useState("");
  const [minutes, setMinutes] = useState("");

  const durationSeconds =
    Number(hour) * 60 * 60 * 1000 + Number(minutes) * 60 * 1000;
  const onSubmit = async () => {
    await addDoc(collection(firestore, "schedule"), {
      id: Date.now(),
      title,
      start: startTime,
      end: startTime,
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
                      type="date"
                      required
                      disabled={
                        !auth.currentUser?.email?.startsWith("shimwoan@")
                      }
                      className="border-none p-0"
                    />
                  </div>
                </div>

                <div className="flex gap-2 my-2">
                  <Input
                    type="number"
                    value={hour}
                    onChange={(e) => setHour(e.target.value)}
                    placeholder="시간"
                  />
                  <Input
                    type="number"
                    value={minutes}
                    onChange={(e) => setMinutes(e.target.value)}
                    placeholder="분"
                  />
                </div>

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
