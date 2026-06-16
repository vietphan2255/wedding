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
          defaultEn="Kindly respond"
          defaultVi="Xin vui lòng phản hồi"
        />
        <LabelField
          fieldKey="rsvp.title"
          label="Title"
          defaultEn="Will you join us?"
          defaultVi="Bạn sẽ đến chứ?"
        />
        <LabelField
          fieldKey="rsvp.divider"
          label="Divider text"
          defaultEn="rsvp"
          defaultVi="rsvp"
        />
        <LabelField
          fieldKey="rsvp.subtitle"
          label="Subtitle"
          defaultEn="Your response means the world. Please reply by 30 June 2026."
          defaultVi="Phản hồi của bạn là niềm vui lớn của tụi mình. Xin gửi trước ngày 30/06/2026."
          multiline
        />
        <LabelField
          fieldKey="rsvp.submit"
          label="Submit button"
          defaultEn="Send RSVP"
          defaultVi="Gửi xác nhận"
        />
        <LabelField
          fieldKey="rsvp.success.title"
          label="Success title"
          defaultEn="Thank you!"
          defaultVi="Cảm ơn bạn!"
        />
        <LabelField
          fieldKey="rsvp.success.body"
          label="Success body"
          defaultEn="Your RSVP has been received. We can't wait to celebrate with you."
          defaultVi="Tụi mình đã nhận được xác nhận. Hẹn gặp bạn trong ngày trọng đại."
          multiline
        />
      </LabelsPanel>
    </div>
  )
}
