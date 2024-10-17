"use client";

import { Calendar, Views, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "moment/locale/ko";
import Stopwatch from "@/components/ui/stopwatch";
import React, { useEffect, useMemo, useState } from "react";
import "@/lib/react-big-calendar.css";
import { ModalCreateEvent } from "@/components/modal-create-event";
import { useAuth, useFirestore, useFirestoreCollectionData } from "reactfire";
import { collection, query } from "firebase/firestore";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ModalBilling } from "@/components/modal-billing";

const localizer = momentLocalizer(moment);

const ColoredDateCellWrapper = ({ children, event, ...rest }: any) => {
  const totalHour = moment.utc(event.time).format("HH");
  const totalMinute = moment.utc(event.time).add(1, "minute").format("mm");
  const totalTime = `${Number(totalHour) ? `${Number(totalHour)}시간` : ""} ${
    Number(totalMinute) ? `${Number(totalMinute)}분 ` : ""
  }`;

  return React.cloneElement(React.Children.only(children), {
    children: (
      <div className="rbc-event-content">
        {event.title} <span className="text-[12px]">({totalTime})</span>
      </div>
    ),
  });
};

export default function Home() {
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
    []
  );

  const [time, setTime] = useState(0);
  const [isOpenModalCreateEvent, setIsOpenModalCreateEvent] = useState(false);
  const onSaveTime = (time: number) => {
    setTime(time);
    setIsOpenModalCreateEvent(true);
  };

  // set up query
  const firestore = useFirestore();
  const scheduleCollection = collection(firestore, "schedule");
  const scheduleQuery = query(scheduleCollection);

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
    if (!auth.currentUser) {
      toast({ title: "로그인이 필요합니다." });
      router.push("/login");
      return false;
    }

    return true;
  };

  const totalSeconds = newSchedules?.reduce((acc, cur: any) => {
    return acc + cur.time;
  }, 0);
  const totalHour = moment.utc(totalSeconds).format("HH");
  const totalMinute = moment.utc(totalSeconds).add(1, "minute").format("mm");
  const totalTime = `${Number(totalHour) ? `${Number(totalHour)}시간` : ""} ${
    Number(totalMinute) ? `${Number(totalMinute)}분 ` : ""
  }`;

  const [domLoaded, setDomLoaded] = useState(false);
  useEffect(() => {
    setDomLoaded(true);
  }, []);

  const [isOpenModalBilling, setIsOpenModalBilling] = useState(false);

  return (
    <>
      <ModalCreateEvent
        isOpen={isOpenModalCreateEvent}
        setIsOpen={setIsOpenModalCreateEvent}
        time={time}
      />
      <ModalBilling
        schedules={newSchedules as any}
        isOpen={isOpenModalBilling}
        setIsOpen={setIsOpenModalBilling}
      />

      <div className="flex flex-col items-center gap-8 -mt-10">
        <Stopwatch
          onStart={onStartStopwatch}
          onSave={onSaveTime}
          className="mb-auto"
        />
        <section className="relative container h-[600px]">
          <div className="absolute top-[-48px] right-0 flex items-end gap-2 px-8">
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
    </>
  );
}
