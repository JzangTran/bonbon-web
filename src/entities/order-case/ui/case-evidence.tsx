import { formatDateTime, formatVnd } from "@/shared/lib/format";
import { Badge } from "@/shared/ui/badge";
import { Card } from "@/shared/ui/card";
import {
  CASE_STATUS,
  CASE_TYPE_LABEL,
  CUSTOMER_ANSWER,
  NO_SHOW_OUTCOME,
} from "../labels";
import type { OrderCase } from "../api";

/** One case as the shop and the administrator read it: what was claimed, the evidence, both sides' words and the outcome. */
export function CaseEvidence({ orderCase }: { orderCase: OrderCase }) {
  const status = CASE_STATUS[orderCase.status ?? ""] ?? {
    label: orderCase.status ?? "",
    className: "",
  };
  // A no-show claims no money and has no lines; the note is the shop's account of the door, not the customer's.
  const noShow = orderCase.type === "CUSTOMER_NO_SHOW";
  return (
    <div className="flex flex-col gap-4">
      <Card className="gap-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-lg font-semibold">
              Đơn #{orderCase.orderNumber}
            </span>
            <Badge variant="outline">
              {CASE_TYPE_LABEL[orderCase.type ?? ""] ?? orderCase.type}
            </Badge>
            <Badge className={status.className}>{status.label}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Gửi lúc {formatDateTime(orderCase.openedAt)}
          </p>
        </div>
        <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1 text-sm">
          {orderCase.customerName ? (
            <>
              <dt className="text-muted-foreground">Người nhận</dt>
              <dd>{orderCase.customerName}</dd>
            </>
          ) : null}
          {!noShow ? (
            <>
              <dt className="text-muted-foreground">Khách được hoàn</dt>
              <dd className="font-semibold tabular-nums">
                {formatVnd(orderCase.refundAmount)}
              </dd>
            </>
          ) : null}
          {!noShow && orderCase.shopBears !== undefined ? (
            <>
              <dt className="text-muted-foreground">Quán chịu</dt>
              <dd className="tabular-nums">
                {formatVnd(orderCase.shopBears)} (đã trừ hoa hồng được hoàn lại)
              </dd>
            </>
          ) : null}
          {orderCase.status === "AWAITING_SHOP" &&
          orderCase.shopResponseDueAt ? (
            <>
              <dt className="text-muted-foreground">Hạn trả lời</dt>
              <dd>{formatDateTime(orderCase.shopResponseDueAt)}</dd>
            </>
          ) : null}
        </dl>
      </Card>

      {!noShow ? (
        <Card className="gap-2 p-4">
          <h3 className="font-semibold">Món bị báo</h3>
          <ul className="divide-y text-sm">
            {(orderCase.lines ?? []).map((line) => (
              <li
                key={line.orderItemId}
                className="flex items-center justify-between gap-3 py-2"
              >
                <span>
                  {line.quantity} × {line.name}
                </span>
                <span className="tabular-nums">
                  {formatVnd(line.refundAmount)}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {orderCase.note ? (
        <Card className="gap-1 p-4">
          <h3 className="font-semibold">{noShow ? "Quán báo" : "Khách nói"}</h3>
          <p className="text-sm whitespace-pre-wrap">{orderCase.note}</p>
        </Card>
      ) : null}

      {(orderCase.photos ?? []).length > 0 ? (
        <Card className="gap-2 p-4">
          <h3 className="font-semibold">Ảnh khách gửi</h3>
          <div className="flex flex-wrap gap-3">
            {(orderCase.photos ?? []).map((photo) => (
              <a
                key={photo.key}
                href={photo.url}
                target="_blank"
                rel="noreferrer"
                className="block size-32 overflow-hidden rounded-sm border bg-muted"
              >
                <img
                  src={photo.url}
                  alt="Ảnh khách gửi"
                  className="size-full object-cover"
                />
              </a>
            ))}
          </div>
        </Card>
      ) : null}

      {orderCase.shopResponse ? (
        <Card className="gap-1 p-4">
          <h3 className="font-semibold">Quán trả lời</h3>
          <p className="text-sm">
            {orderCase.shopResponse === "ACCEPTED"
              ? "Quán chấp nhận."
              : "Quán phản đối."}
          </p>
          {orderCase.shopResponseNote ? (
            <p className="text-sm whitespace-pre-wrap">
              {orderCase.shopResponseNote}
            </p>
          ) : null}
        </Card>
      ) : null}

      {orderCase.customerAnswer ? (
        <Card className="gap-1 p-4">
          <h3 className="font-semibold">Khách trả lời</h3>
          <p className="text-sm">
            {CUSTOMER_ANSWER[orderCase.customerAnswer] ??
              orderCase.customerAnswer}
          </p>
          {orderCase.customerAnswerNote ? (
            <p className="text-sm whitespace-pre-wrap">
              {orderCase.customerAnswerNote}
            </p>
          ) : null}
        </Card>
      ) : null}

      {orderCase.noShowOutcome ? (
        <p className="text-sm text-muted-foreground">
          Kết cục:{" "}
          {NO_SHOW_OUTCOME[orderCase.noShowOutcome] ?? orderCase.noShowOutcome}
        </p>
      ) : null}

      {orderCase.decidedAt ? (
        <Card className="gap-1 p-4">
          <h3 className="font-semibold">Kết quả</h3>
          <p className="text-sm">
            {orderCase.status === "UPHELD" ? "Được chấp nhận" : "Bị bác bỏ"}
            {orderCase.decidedBy === "SHOP"
              ? " bởi quán"
              : orderCase.decidedBy === "ADMIN"
                ? " bởi quản trị viên"
                : ""}{" "}
            lúc {formatDateTime(orderCase.decidedAt)}.
          </p>
          {orderCase.reason ? (
            <p className="text-sm whitespace-pre-wrap">{orderCase.reason}</p>
          ) : null}
        </Card>
      ) : null}
    </div>
  );
}
