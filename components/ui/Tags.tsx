"use client"

// ...existing code...
import { Badge } from "@/components/ui/badge"


interface tagsProps{
    data: any;
}
export const Tags: React.FC<tagsProps> = ({ data }) => {
    const Tagarr= data.tags.split(",").map((tag: string) => tag.trim());

    return (
        // @ts-ignore
        <div className="max-w-sm p-4">
            {Tagarr.map((tag: string, index: number) => (
                <Badge key={index} variant="outline" className="rounded-sm text-sm w-fit m-1 hover:cursor-pointer">{tag}</Badge>
            ))}
        </div>
    )
}