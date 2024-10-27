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
import { addDoc, collection, doc, setDoc } from "firebase/firestore";
import { useAuth, useFirestore } from "reactfire";

interface ModalCreateEventProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  time: number;
  startTime: string;
  setStartTime: (date: string) => void;
  endTime: string;
  setEndTime: (date: string) => void;
}

export const ModalCreateEvent: FC<ModalCreateEventProps> = ({
  time,
  isOpen,
  setIsOpen,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
}) => {
  const auth = useAuth();
  const firestore = useFirestore();

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
          <DialogHeader>
            <DialogTitle>등록</DialogTitle>
            <DialogDescription>
              {/* Enter your email to reset your password */}
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-3">
            <div>
              <Label htmlFor="startDate">시작 일</Label>
              <Input
                value={startTime}
                onChange={handleChange(setStartTime)}
                name="startDate"
                type="datetime-local"
                required
                disabled={!auth.currentUser?.email?.startsWith("shimwoan@")}
                className="border-none p-0"
              />
            </div>
            <div>
              <Label htmlFor="startDate">종료 일</Label>
              <Input
                value={endTime}
                onChange={handleChange(setEndTime)}
                disabled={!auth.currentUser?.email?.startsWith("shimwoan@")}
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

          <Button onClick={() => onSubmit()} className="mt-8">
            등록
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};
