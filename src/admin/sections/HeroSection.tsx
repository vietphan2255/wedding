import LabelsPanel from './LabelsPanel.jsx'
import LabelField from './LabelField.jsx'

export default function HeroSection() {
  return (
    <div>
      <header className="mb-5">
        <p className="eyebrow">Hero</p>
        <h2 className="font-display text-2xl md:text-3xl mt-1">
          Hero section
        </h2>
        <p className="text-sm text-muted mt-2">
          Top of the page. Couple names live under Common · Couple.
        </p>
      </header>

      <LabelsPanel
        title="Hero labels"
        help="Keep the date string in the form `26 July · 02 August · 2026` (with the `·` separators) so the hero → countdown animation matches."
      >
        <LabelField
          fieldKey="hero.eyebrow"
          label="Eyebrow"
          defaultEn="We are getting married"
          defaultVi="Chúng mình sắp về chung một nhà"
        />
        <LabelField
          fieldKey="hero.and"
          label="Conjunction"
          defaultEn="&"
          defaultVi="&"
        />
        <LabelField
          fieldKey="hero.saveTheDate"
          label="Save the date"
          defaultEn="Save the Date"
          defaultVi="Lưu lại ngày vui"
        />
        <LabelField
          fieldKey="hero.dates"
          label="Date line"
          defaultEn="26 July  ·  02 August  ·  2026"
          defaultVi="26 Tháng 07  ·  02 Tháng 08  ·  2026"
          help="Use the `·` separator (Option+8 on Mac) so the hero → countdown flight animation can split it."
        />
        <LabelField
          fieldKey="hero.scroll"
          label="Scroll prompt"
          defaultEn="Scroll to discover"
          defaultVi="Cuộn để khám phá"
        />
      </LabelsPanel>
    </div>
  )
}
