import { HelpCircle } from "lucide-react"
import { TooltipProvider, TooltipRoot, TooltipTrigger, TooltipContent } from "@/components/tooltip"

interface FieldTooltipProps {
  text: string
}

export function FieldTooltip({ text }: FieldTooltipProps) {
  return (
    <TooltipProvider>
      <TooltipRoot>
        <TooltipTrigger asChild>
          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help ml-1" />
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs">{text}</p>
        </TooltipContent>
      </TooltipRoot>
    </TooltipProvider>
  )
}
