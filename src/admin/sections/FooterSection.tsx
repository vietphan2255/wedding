import LabelsPanel from './LabelsPanel.jsx'
import LabelField from './LabelField.jsx'

export default function FooterSection() {
  return (
    <div>
      <header className="mb-5">
        <p className="eyebrow">Footer</p>
        <h2 className="font-display text-2xl md:text-3xl mt-1">Footer</h2>
        <p className="text-sm text-muted mt-2">
          Couple names, the date line, and the contact email come from
          Common · Couple — change them there.
        </p>
      </header>

      <LabelsPanel title="Footer labels">
        <LabelField
          fieldKey="footer.tagline"
          label="Tagline"
          defaultVi="Thực hiện bằng cả trái tim · 2026"
        />
        <LabelField
          fieldKey="footer.contact"
          label="Contact intro"
          defaultVi="Mọi thắc mắc xin liên hệ"
        />
      </LabelsPanel>
    </div>
  )
}
