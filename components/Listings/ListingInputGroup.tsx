import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { cn } from "@/lib/utils"

export function ListingInputGroup() {
  return (
    <Field className="w-full">
      <FieldLabel htmlFor="inline-start-input">Title</FieldLabel>
      <InputGroup>
        <InputGroupInput className={cn("w-full p-4", "")} id="inline-start-input" placeholder="Title..." />

      </InputGroup>
      <FieldDescription>Icon positioned at the start.</FieldDescription>
    </Field>
  )
}
