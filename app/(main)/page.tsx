"use client";

import { Calendar, Views, momentLocalizer } from "react-big-calendar";
import Stopwatch from "@/components/ui/stopwatch";
import React, { useEffect, useMemo, useRef, useState } from "react";
import "@/lib/react-big-calendar.css";
import { useAuth, useFirestore, useFirestoreCollectionData } from "reactfire";
import {
  collection,
  addDoc,
  doc,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ModalBilling } from "@/components/modal-billing";
import moment from "moment";
import momentDurationFormatSetup from "moment-duration-format";
import "moment/locale/ko";
import BgImg from "@/components/bg-img";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { Check } from "lucide-react";
import { getMockSenderEnhancer } from "@rpldy/mock-sender";
import { Label } from "@/components/ui/label";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import Uploady, {
  useItemStartListener,
  useItemFinalizeListener,
} from "@rpldy/uploady";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import UploadPreview from "@rpldy/upload-preview";
import withPasteUpload from "@rpldy/upload-paste";
const mockSenderEnhancer = getMockSenderEnhancer();

momentDurationFormatSetup(moment as any);
moment.locale("ko");
const PasteInput = withPasteUpload(Input);

const localizer = momentLocalizer(moment);
const ColoredDateCellWrapper = ({ children, event, ...rest }: any) => {
  const { register } = useFormContext();
  const totalHour = moment.utc(event.time).format("HH");
  const totalMinute = moment.utc(event.time).add(1, "minute").format("mm");
  const totalTime = `${Number(totalHour) ? `${Number(totalHour)}시간` : ""} ${
    Number(totalMinute) ? `${Number(totalMinute)}분 ` : ""
  }`;
  return React.cloneElement(React.Children.only(children), {
    children: (
      <div
        className={`"rbc-event-content" ${
          event.state === "DONE" ? "opacity-30" : ""
        }`}
      >
        <p className="p-1 bg-white">
          <div className="relative z-100">
            <input
              {...register("done")}
              type={"checkbox"}
              value={event.NO_ID_FIELD}
              className="cursor-pointer"
            />
          </div>
          {event.title}{" "}
          <span className="inline-flex text-[12px]">({totalTime})</span>
        </p>
        {event.img && <BgImg src={event.img} alt="" />}
      </div>
    ),
  });
};

export default function Home() {
  const [time, setTime] = useState(0);
  const [startTime, setStartTime] = useState(
    moment(Date.now() - time).format("yyyy-MM-DD")
  );

  const { components, messages, defaultDate, views } = useMemo(
    () => ({
      components: {
        eventWrapper: ColoredDateCellWrapper,
      },
      defaultDate: new Date(),
      views: Object.keys(Views)
        .filter((x) => x !== "WORK_WEEK")
        .map((k) => (Views as any)[k]),
      messages: {
        week: "주",
        day: "일",
        month: "월",
        previous: "<",
        next: ">",
        today: `오늘`,
        agenda: "아젠다",
      },
    }),
    [moment]
  );

  const [isOpenModalCreateEvent, setIsOpenModalCreateEvent] = useState(false);
  const onSaveTime = () => {
    setTime(time);
    setIsOpenModalCreateEvent(true);
  };
  // set up query
  const firestore = useFirestore();
  const scheduleCollection = collection(firestore, "schedule");
  const scheduleQuery = query(scheduleCollection, orderBy("end"));

  // ReactFire!
  const { status, data: schedules } = useFirestoreCollectionData(scheduleQuery);
  const newSchedules = useMemo(
    () =>
      schedules?.map((item) => ({
        ...item,
        start: moment(item.start).toDate(),
        end: moment(item.end).toDate(),
      })),
    [schedules]
  );

  const auth = useAuth();
  const router = useRouter();
  const onStartStopwatch = () => {
    setStartTime(moment().format("yyyy-MM-DD HH:mm"));

    // if (!auth.currentUser) {
    //   toast({ title: "로그인이 필요합니다." });
    //   router.push("/login");
    //   return false;
    // }

    return true;
  };

  const notDoneNewSchedules = newSchedules?.filter(
    (item: any) => item.state !== "DONE"
  );
  const totalSeconds = notDoneNewSchedules?.reduce((acc, cur: any) => {
    return acc + cur.time;
  }, 0);
  const hour = Math.trunc(
    moment.duration(totalSeconds, "milliseconds").asHours()
  );
  const forMinuteSeconds =
    totalSeconds - moment.duration(hour, "hours").asMilliseconds();
  const minutes = moment.duration(forMinuteSeconds, "milliseconds").asMinutes();
  const totalTime = `${Math.floor(hour / 8)}일 ${hour % 8}시간 ${minutes}분`;

  const [domLoaded, setDomLoaded] = useState(false);
  useEffect(() => {
    setDomLoaded(true);
  }, []);

  const [isOpenModalBilling, setIsOpenModalBilling] = useState(false);

  const methods = useForm();
  const checks = methods.watch("done");
  const handleDeleteClick = async () => {
    checks.forEach(async (id: any) => {
      await updateDoc(doc(firestore, "schedule", id), {
        state: "DONE",
      });
    });
  };

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

  const [imgUploadLoading, setImgUploadLoading] = useState(false);
  const [imgURL, setImgURL] = useState("");
  const [hourValue, setHourValue] = useState("");
  const [minutesValue, setMinutesValue] = useState("");
  const [title, setTitle] = useState("");

  const durationSeconds =
    Number(hourValue) * 60 * 60 * 1000 + Number(minutesValue) * 60 * 1000;
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
  };

  const handleChange = (setTime: (date: string) => void) => (ev: any) => {
    if (!ev.target["validity"].valid) return;
    const dt = ev.target["value"];
    setTime(dt);
  };

  return (
    <FormProvider {...methods}>
      <Uploady debug enhancer={mockSenderEnhancer}>
        <div className="w-[600px] mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <div>
              <Label htmlFor="startDate">시작 일</Label>
              <Input
                value={startTime}
                onChange={handleChange(setStartTime)}
                name="startDate"
                type="date"
                required
                disabled={!auth.currentUser?.email?.startsWith("shimwoan@")}
                className="border-none p-0"
              />
            </div>
          </div>

          <div className="flex gap-2 my-2">
            <Input
              type="number"
              value={hourValue}
              onChange={(e) => setHourValue(e.target.value)}
              placeholder="시간"
            />
            <Input
              type="number"
              value={minutesValue}
              onChange={(e) => setMinutesValue(e.target.value)}
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

          <Button
            disabled={imgUploadLoading}
            onClick={() => onSubmit()}
            className="w-full mt-3"
          >
            등록
          </Button>
        </div>
      </Uploady>

      <ModalBilling
        schedules={notDoneNewSchedules as any}
        isOpen={isOpenModalBilling}
        setIsOpen={setIsOpenModalBilling}
      />
      <div className="flex flex-col items-center gap-4">
        <section className="relative container h-[600px] px-0">
          <Button
            className="mb-2"
            size="sm"
            onClick={() => handleDeleteClick()}
          >
            완료 처리
          </Button>
          <div className="absolute top-[-48px] right-0 flex items-end gap-5">
            {!!totalSeconds && domLoaded && `이번달 총 시간: ${totalTime}`}
            <Button
              onClick={() => setIsOpenModalBilling(true)}
              variant="teal"
              size="sm"
            >
              비용 청구
            </Button>
          </div>
          <div className={cn("h-full")}>
            <Calendar
              components={components}
              defaultDate={defaultDate}
              events={newSchedules}
              localizer={localizer}
              messages={messages}
              showMultiDayTimes
              step={60}
              views={views}
            />
          </div>
        </section>
      </div>
    </FormProvider>
  );
}
