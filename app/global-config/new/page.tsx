import { ConfigForm } from "../components/config-form"

const NewConfigPage = () => {
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ConfigForm />
      </div>
    </div>
  )
}

export default NewConfigPage
