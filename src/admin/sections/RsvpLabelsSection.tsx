import LabelsPanel from './LabelsPanel.jsx'
import LabelField from './LabelField.jsx'

export default function RsvpLabelsSection() {
  return (
    <div>
      <header className="mb-5">
        <p className="eyebrow">RSVP</p>
        <h2 className="font-display text-2xl md:text-3xl mt-1">RSVP section</h2>
        <p className="text-sm text-muted mt-2">
          Edit the headline and CTA text shown on the RSVP form. Submitted
          responses appear in Submissions · RSVPs.
        </p>
      </header>

      <LabelsPanel title="RSVP labels">
        <LabelField
          fieldKey="rsvp.eyebrow"
          label="Eyebrow"
          defaultVi="Xin vui lòng phản hồi"
        />
        <LabelField
          fieldKey="rsvp.title"
          label="Title"
          defaultVi="Bạn sẽ đến chứ?"
        />
        <LabelField
          fieldKey="rsvp.divider"
          label="Divider text"
          defaultVi="rsvp"
        />
        <LabelField
          fieldKey="rsvp.subtitle"
          label="Subtitle"
          defaultVi="Phản hồi của bạn là niềm vui lớn của tụi mình. Xin gửi trước ngày 30/06/2026."
          multiline
        />
        <LabelField
          fieldKey="rsvp.submit"
          label="Submit button"
          defaultVi="Gửi xác nhận"
        />
        <LabelField
          fieldKey="rsvp.success.title"
          label="Success title"
          defaultVi="Cảm ơn bạn!"
        />
        <LabelField
          fieldKey="rsvp.success.body"
          label="Success body"
          defaultVi="Tụi mình đã nhận được xác nhận. Hẹn gặp bạn trong ngày trọng đại."
          multiline
        />
      </LabelsPanel>
    </div>
  )
}
