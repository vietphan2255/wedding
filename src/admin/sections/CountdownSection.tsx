import LabelsPanel from './LabelsPanel.jsx'
import LabelField from './LabelField.jsx'

export default function CountdownSection() {
  return (
    <div>
      <header className="mb-5">
        <p className="eyebrow">Countdown</p>
        <h2 className="font-display text-2xl md:text-3xl mt-1">
          Countdown section
        </h2>
        <p className="text-sm text-muted mt-2">
          The countdown reads dates from Common · Dates and shows time
          remaining to the next ceremony.
        </p>
      </header>

      <LabelsPanel title="Countdown labels">
        <LabelField
          fieldKey="countdown.eyebrow"
          label="Eyebrow"
          defaultVi="Ngày trọng đại"
        />
        <LabelField
          fieldKey="countdown.titleNext"
          label="Title (next event)"
          defaultVi="Đếm ngược đến"
        />
        <LabelField
          fieldKey="countdown.months"
          label="Unit: months"
          defaultVi="Tháng"
        />
        <LabelField
          fieldKey="countdown.weeks"
          label="Unit: weeks"
          defaultVi="Tuần"
        />
        <LabelField
          fieldKey="countdown.days"
          label="Unit: days"
          defaultVi="Ngày"
        />
        <LabelField
          fieldKey="countdown.hours"
          label="Unit: hours"
          defaultVi="Giờ"
        />
        <LabelField
          fieldKey="countdown.minutes"
          label="Unit: minutes"
          defaultVi="Phút"
        />
        <LabelField
          fieldKey="countdown.seconds"
          label="Unit: seconds"
          defaultVi="Giây"
        />
        <LabelField
          fieldKey="countdown.passed"
          label="Post-wedding message"
          defaultVi="Chúng mình đã thành đôi! Cảm ơn bạn đã ở đây cùng tụi mình."
          multiline
        />
        <LabelField
          fieldKey="countdown.prevEvent"
          label="Prev-event button"
          defaultVi="Sự kiện trước"
        />
        <LabelField
          fieldKey="countdown.nextEvent"
          label="Next-event button"
          defaultVi="Sự kiện kế tiếp"
        />
      </LabelsPanel>
    </div>
  )
}
