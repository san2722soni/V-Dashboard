import { BuildingForm } from "../components/building-form"

const NewBuildingPage = () => {
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <BuildingForm />
      </div>
    </div>
  )
}

export default NewBuildingPage
