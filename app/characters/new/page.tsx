import { CharacterForm } from "../components/character-form"

const NewCharacterPage = () => {
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <CharacterForm />
      </div>
    </div>
  )
}

export default NewCharacterPage
