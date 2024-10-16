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
import { useFirestore } from "reactfire";

interface ModalCreateEventProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  time: number;
}

export const ModalCreateEvent: FC<ModalCreateEventProps> = ({
  time,
  isOpen,
  setIsOpen,
}) => {
  const firestore = useFirestore();

  const startTime = moment(Date.now() - time).format("yyyy-MM-DD HH:mm");
  const endTime = moment(Date.now()).format("yyyy-MM-DD HH:mm");
  const [title, setTitle] = useState("");

  const onSubmit = async () => {
    await addDoc(collection(firestore, "schedule"), {
      id: Date.now(),
      title,
      start: startTime,
      end: endTime,
      time,
    });
    toast({ title: "성공적으로 저장되었습니다." });
    setIsOpen(false);
    setTitle("");
  };

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
                name="startDate"
                type="datetime-local"
                required
                disabled
                className="border-none p-0"
              />
            </div>
            <div>
              <Label htmlFor="startDate">종료 일</Label>
              <Input
                value={title}
                disabled={true}
                name="startDate"
                type="datetime-local"
                className="border-none p-0"
                required
              />
            </div>
          </div>
          <p className="mb-auto">
            총 시간: {moment.utc(time).add("minute", 1).format("HH시 mm분")}
          </p>

          <Label htmlFor="title" className="mt-5">
            제목
          </Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.currentTarget.value)}
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
