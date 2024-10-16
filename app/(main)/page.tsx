"use client";

import { Calendar, Views, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "moment/locale/ko";
import Stopwatch from "@/components/ui/stopwatch";
import React, { useMemo, useState } from "react";
import "@/lib/react-big-calendar.css";
import { ModalCreateEvent } from "@/components/modal-create-event";
import { useAuth, useFirestore, useFirestoreCollectionData } from "reactfire";
import { collection, query } from "firebase/firestore";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

const localizer = momentLocalizer(moment);

const ColoredDateCellWrapper = ({ children, event, ...rest }: any) => {
  const durationSeconds = moment
    .duration(moment(event.end).diff(event.start))
    .asMilliseconds();
  const hour = Number(moment.utc(durationSeconds).format("HH"));
  const minute = Number(moment.utc(durationSeconds).format("MM"));

  return React.cloneElement(React.Children.only(children), {
    children: (
      <div className="rbc-event-content">
        {event.title}{" "}
        <span className="text-[12px]">
          ({Number(hour) ? `${hour}시간` : ""}{" "}
          {Number(minute) ? `${minute}분` : ""})
        </span>
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

  return (
    <>
      <ModalCreateEvent
        isOpen={isOpenModalCreateEvent}
        setIsOpen={setIsOpenModalCreateEvent}
        time={time}
      />
      <div className="flex flex-col items-center gap-8 -mt-10">
        <Stopwatch
          onStart={onStartStopwatch}
          onSave={onSaveTime}
          className="mb-auto"
        />

        <section className="relative container h-[600px]">
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
