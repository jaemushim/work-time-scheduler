import { FC } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Page,
  Text,
  View,
  Document,
  PDFViewer,
  Font,
  Image,
} from "@react-pdf/renderer";
import moment from "moment";
type Schedule = {
  id: number;
  title: string;
  start: string;
  end: string;
  time: number;
  img?: string;
};

interface ModalBillingProps {
  schedules: Schedule[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

Font.register({
  family: "Noto Sans KR",
  fonts: [
    {
      src: "/fonts/NotoSansKR-Regular.ttf",
      fontWeight: 400,
    },
    {
      src: "/fonts/NotoSansKR-Medium.ttf",
      fontWeight: 500,
    },
    {
      src: "/fonts/NotoSansKR-SemiBold.ttf",
      fontWeight: 600,
    },
    {
      src: "/fonts/NotoSansKR-Bold.ttf",
      fontWeight: 700,
    },
    {
      family: "Nanum Gothic",
      src: "https://fonts.gstatic.com/ea/nanumgothic/v5/NanumGothic-ExtraBold.ttf",
    },
  ],
});
Font.registerHyphenationCallback((word) => ["", word, ""]);

export const ModalBilling: FC<ModalBillingProps> = ({
  schedules,
  isOpen,
  setIsOpen,
}) => {
  const totalSeconds = schedules?.reduce((acc, cur: any) => {
    return acc + cur.time;
  }, 0);
  const hour = Math.trunc(
    moment.duration(totalSeconds, "milliseconds").asHours()
  );
  const forMinuteSeconds =
    totalSeconds - moment.duration(hour, "hours").asMilliseconds();
  const minutes = moment.duration(forMinuteSeconds, "milliseconds").asMinutes();

  const totalTime = `${Math.floor(hour / 8)}일 ${hour % 8}시간 ${minutes}분`;

  const PER_HOUR_PRICE = 28410;
  const price = ((hour + 1) * PER_HOUR_PRICE).toLocaleString("ko-KR");

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-full h-[calc(100%-80px)] max-h-[800px] container">
          <PDFViewer className="w-full h-full min-h-[600px]">
            <Document>
              <Page
                style={{
                  fontSize: "12px",
                  lineHeight: "1.3",
                  fontFamily: "Noto Sans KR",
                  padding: "32px",
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    marginBottom: "32px",
                    fontWeight: "medium",
                    fontSize: "24px",
                  }}
                >
                  비용 청구
                </Text>
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    paddingBottom: "6px",
                    marginBottom: "4px",
                    borderBottom: "1px solid #aaa",
                    fontWeight: "medium",
                  }}
                >
                  <Text style={{ width: "55%", textAlign: "center" }}>
                    항목
                  </Text>
                  <Text style={{ width: "20%", textAlign: "center" }}>
                    소요시간
                  </Text>
                  <Text style={{ width: "25%", textAlign: "center" }}>
                    처리일자
                  </Text>
                </View>

                {schedules?.map((item) => {
                  const totalHour = moment.utc(item.time).format("HH");
                  const totalMinute = moment
                    .utc(item.time)
                    .add(1, "minute")
                    .format("mm");
                  const totalTime = `${
                    Number(totalHour) ? `${Number(totalHour)}시간` : ""
                  } ${Number(totalMinute) ? `${Number(totalMinute)}분 ` : ""}`;

                  return (
                    <View key={item.id}>
                      <View
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "space-between",
                          padding: "4px 0",
                          fontSize: "11px",
                        }}
                      >
                        <Text style={{ width: "55%", textAlign: "center" }}>
                          {item.title}
                        </Text>
                        <Text style={{ width: "20%", textAlign: "center" }}>
                          {totalTime}
                        </Text>
                        <Text style={{ width: "25%", textAlign: "center" }}>
                          {moment(item.end).format("YYYY-MM-DD")}
                        </Text>
                      </View>
                      {item.img && (
                        <Image
                          src={item.img}
                          style={{ marginBottom: "8px" }}
                        ></Image>
                      )}
                    </View>
                  );
                })}

                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    padding: "6px 0",
                    marginTop: "28px",
                    fontSize: "11px",
                    borderTop: "1px solid #000",
                  }}
                >
                  <Text
                    style={{
                      width: "55%",
                      fontWeight: "medium",
                      textAlign: "center",
                    }}
                  >
                    합계
                  </Text>
                  <Text style={{ width: "20%", textAlign: "center" }}>
                    {totalTime}
                  </Text>
                  <Text style={{ width: "25%", textAlign: "center" }}></Text>
                </View>

                <View style={{ marginTop: "24px" }}>
                  <Text>
                    프론트엔드 개발자 프리랜서 1달 단가 (일 8시간 주 5회 22일
                    근무 기준) 500만원 으로 계산
                  </Text>
                  <Text style={{ marginTop: "12px" }}>합계: {price}원</Text>
                  <Text style={{ marginTop: "12px" }}>
                    계좌: 신한은행 110 368 702273 심재무
                  </Text>
                </View>
              </Page>
            </Document>
          </PDFViewer>
        </DialogContent>
      </Dialog>
    </>
  );
};
