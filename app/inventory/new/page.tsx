import { InventoryForm } from "../components/inventory-form"

const NewInventoryPage = () => {
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <InventoryForm />
      </div>
    </div>
  )
}

export default NewInventoryPage
