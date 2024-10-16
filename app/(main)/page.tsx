"use client";

import { Calendar, Views, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "moment/locale/ko";
import Stopwatch from "@/components/ui/stopwatch";
import React, { useMemo, useState } from "react";
import "@/lib/react-big-calendar.css";
import { ModalCreateEvent } from "@/components/modal-create-event";
import { useFirestore, useFirestoreCollectionData } from "reactfire";
import { collection, query } from "firebase/firestore";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

const Loader = dynamic(() => import("@/components/loader"));

const localizer = momentLocalizer(moment);

const ColoredDateCellWrapper = ({ children, event, ...rest }: any) => {
  const hour = Number(moment.utc(event.time).format("HH"));
  const minute = Number(moment.utc(event.time).format("MM"));
  return React.cloneElement(React.Children.only(children), {
    children: (
      <div className="rbc-event-content">
        {event.title}{" "}
        <span className="text-[12px]">
          {!!hour && `(${hour}시)`} {!!minute && `(${minute}분)`}
        </span>
        {/* <p className="absolute right-1 top-[50%] -translate-y-1/2">1h</p> */}
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

  return (
    <>
      <ModalCreateEvent
        isOpen={isOpenModalCreateEvent}
        setIsOpen={setIsOpenModalCreateEvent}
        time={time}
      />
      <div className="flex flex-col items-center gap-8 -mt-10">
        <Stopwatch onSave={onSaveTime} className="mb-auto" />

        <section className="relative container h-[600px]">
          {status === "loading" && (
            <Loader className="absolute left-[50%] top-[42%] -translate-1/2 z-10" />
          )}
          <div
            className={cn("h-full", status === "loading" ? "blur-[1px]" : "")}
          >
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
