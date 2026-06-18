import LabelsPanel from './LabelsPanel.jsx'
import LabelField from './LabelField.jsx'

export default function WishesLabelsSection() {
  return (
    <div>
      <header className="mb-5">
        <p className="eyebrow">Wishes</p>
        <h2 className="font-display text-2xl md:text-3xl mt-1">Wishes section</h2>
        <p className="text-sm text-muted mt-2">
          Edit the headline and CTA text on the wishes form. Submitted
          messages appear in Submissions · Wishes.
        </p>
      </header>

      <LabelsPanel title="Wishes labels">
        <LabelField
          fieldKey="wishes.eyebrow"
          label="Eyebrow"
          defaultVi="Sổ lưu bút"
        />
        <LabelField
          fieldKey="wishes.title"
          label="Title"
          defaultVi="Để lại lời chúc"
        />
        <LabelField
          fieldKey="wishes.subhead"
          label="Subtitle"
          help="Để trống = không hiển thị"
        />
        <LabelField
          fieldKey="wishes.subtitle"
          label="Description"
          defaultVi="Những dòng chữ của bạn sẽ là kỷ niệm tụi mình giữ mãi."
          multiline
        />
        <LabelField
          fieldKey="wishes.submit"
          label="Submit button"
          defaultVi="Gửi lời chúc"
        />
        <LabelField
          fieldKey="wishes.empty"
          label="Empty state"
          defaultVi="Hãy là người đầu tiên gửi lời chúc nhé."
        />
      </LabelsPanel>
    </div>
  )
}
