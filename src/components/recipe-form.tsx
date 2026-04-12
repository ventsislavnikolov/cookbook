import * as React from "react"
import { PlusIcon, XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type IngredientRow = {
  name: string
  quantity: string
  unit: string
  notes: string
}

type StepRow = {
  instruction: string
  duration: string
}

export type RecipeFormValues = {
  title: string
  description: string
  prepTime: string
  cookTime: string
  servings: string
  difficulty: string
  cuisine: string
  tags: string
  ingredients: IngredientRow[]
  steps: StepRow[]
}

export const emptyRecipeForm: RecipeFormValues = {
  title: "",
  description: "",
  prepTime: "",
  cookTime: "",
  servings: "",
  difficulty: "",
  cuisine: "",
  tags: "",
  ingredients: [{ name: "", quantity: "", unit: "", notes: "" }],
  steps: [{ instruction: "", duration: "" }],
}

export function toServerPayload(values: RecipeFormValues) {
  const parseInt10 = (v: string) => {
    const n = parseInt(v, 10)
    return Number.isFinite(n) ? n : null
  }
  return {
    title: values.title.trim(),
    description: values.description.trim() || null,
    prepTime: parseInt10(values.prepTime),
    cookTime: parseInt10(values.cookTime),
    servings: parseInt10(values.servings),
    difficulty: values.difficulty || null,
    cuisine: values.cuisine.trim() || null,
    tags: values.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    ingredients: values.ingredients
      .filter((i) => i.name.trim().length > 0)
      .map((i) => ({
        name: i.name.trim(),
        quantity: i.quantity.trim() || null,
        unit: i.unit.trim() || null,
        notes: i.notes.trim() || null,
      })),
    steps: values.steps
      .filter((s) => s.instruction.trim().length > 0)
      .map((s) => ({
        instruction: s.instruction.trim(),
        duration: parseInt10(s.duration),
      })),
  }
}

type Props = {
  values: RecipeFormValues
  onChange: (values: RecipeFormValues) => void
  onSubmit: (e: React.FormEvent) => void
  submitLabel: string
  submitting?: boolean
  error?: string | null
  onCancel?: () => void
}

export function RecipeForm({
  values,
  onChange,
  onSubmit,
  submitLabel,
  submitting,
  error,
  onCancel,
}: Props) {
  const update = <K extends keyof RecipeFormValues>(
    key: K,
    value: RecipeFormValues[K],
  ) => onChange({ ...values, [key]: value })

  const addIngredient = () =>
    update("ingredients", [
      ...values.ingredients,
      { name: "", quantity: "", unit: "", notes: "" },
    ])
  const removeIngredient = (idx: number) =>
    update(
      "ingredients",
      values.ingredients.filter((_, i) => i !== idx),
    )
  const updateIngredient = (
    idx: number,
    field: keyof IngredientRow,
    value: string,
  ) =>
    update(
      "ingredients",
      values.ingredients.map((row, i) =>
        i === idx ? { ...row, [field]: value } : row,
      ),
    )

  const addStep = () =>
    update("steps", [...values.steps, { instruction: "", duration: "" }])
  const removeStep = (idx: number) =>
    update(
      "steps",
      values.steps.filter((_, i) => i !== idx),
    )
  const updateStep = (idx: number, field: keyof StepRow, value: string) =>
    update(
      "steps",
      values.steps.map((row, i) =>
        i === idx ? { ...row, [field]: value } : row,
      ),
    )

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="title">
              Title
            </label>
            <Input
              id="title"
              required
              value={values.title}
              onChange={(e) => update("title", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="description">
              Description
            </label>
            <Textarea
              id="description"
              rows={3}
              value={values.description}
              onChange={(e) => update("description", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Prep (min)</label>
              <Input
                type="number"
                min="0"
                value={values.prepTime}
                onChange={(e) => update("prepTime", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Cook (min)</label>
              <Input
                type="number"
                min="0"
                value={values.cookTime}
                onChange={(e) => update("cookTime", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Servings</label>
              <Input
                type="number"
                min="1"
                value={values.servings}
                onChange={(e) => update("servings", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Difficulty</label>
              <Select
                value={values.difficulty}
                onValueChange={(v) => update("difficulty", v ?? "")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="—" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Cuisine</label>
              <Input
                value={values.cuisine}
                onChange={(e) => update("cuisine", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Tags (comma separated)
              </label>
              <Input
                value={values.tags}
                onChange={(e) => update("tags", e.target.value)}
                placeholder="quick, vegetarian"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ingredients</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {values.ingredients.map((ing, idx) => (
            <div
              key={idx}
              className="grid grid-cols-[1fr_auto] items-start gap-2 sm:grid-cols-[1fr_80px_80px_1fr_auto]"
            >
              <Input
                placeholder="Name"
                value={ing.name}
                onChange={(e) => updateIngredient(idx, "name", e.target.value)}
              />
              <Input
                className="hidden sm:block"
                placeholder="Qty"
                value={ing.quantity}
                onChange={(e) =>
                  updateIngredient(idx, "quantity", e.target.value)
                }
              />
              <Input
                className="hidden sm:block"
                placeholder="Unit"
                value={ing.unit}
                onChange={(e) => updateIngredient(idx, "unit", e.target.value)}
              />
              <Input
                className="hidden sm:block"
                placeholder="Notes"
                value={ing.notes}
                onChange={(e) => updateIngredient(idx, "notes", e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeIngredient(idx)}
                disabled={values.ingredients.length === 1}
              >
                <XIcon className="size-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addIngredient}
          >
            <PlusIcon className="size-4" />
            Add ingredient
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Steps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {values.steps.map((step, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <div className="mt-2 flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                {idx + 1}
              </div>
              <div className="flex-1 space-y-2">
                <Textarea
                  rows={2}
                  placeholder="Describe this step"
                  value={step.instruction}
                  onChange={(e) =>
                    updateStep(idx, "instruction", e.target.value)
                  }
                />
                <Input
                  type="number"
                  min="0"
                  placeholder="Duration (min)"
                  className="max-w-[180px]"
                  value={step.duration}
                  onChange={(e) => updateStep(idx, "duration", e.target.value)}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeStep(idx)}
                disabled={values.steps.length === 1}
              >
                <XIcon className="size-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addStep}>
            <PlusIcon className="size-4" />
            Add step
          </Button>
        </CardContent>
      </Card>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  )
}
