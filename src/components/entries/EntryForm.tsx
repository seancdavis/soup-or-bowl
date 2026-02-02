import { Zap, MessageSquare } from "lucide-react";
import { Button, Card } from "../ui";
import type { Entry } from "../../db";

interface EntryFormProps {
  entry?: Entry | null;
}

export function EntryForm({ entry }: EntryFormProps) {
  const isEditing = !!entry;

  return (
    <Card variant="bordered">
      <form action="/api/entries" method="POST" className="space-y-6">
        {/* Method override for updates */}
        {isEditing && <input type="hidden" name="_method" value="PUT" />}
        {isEditing && <input type="hidden" name="id" value={entry.id} />}

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-primary-200 mb-2">
            Entry Name
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            maxLength={255}
            defaultValue={entry?.title ?? ""}
            placeholder="e.g., Grandma's Famous Chili"
            className="w-full px-4 py-3 bg-primary-800/50 border border-primary-600 rounded-lg text-white placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-primary-200 mb-2">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={4}
            defaultValue={entry?.description ?? ""}
            placeholder="Tell us about your entry! What makes it special?"
            className="w-full px-4 py-3 bg-primary-800/50 border border-primary-600 rounded-lg text-white placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Needs Power */}
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="needsPower"
            name="needsPower"
            defaultChecked={entry?.needsPower ?? false}
            className="mt-1 w-5 h-5 rounded border-primary-600 bg-primary-800/50 text-gold-500 focus:ring-gold-500 focus:ring-offset-primary-950"
          />
          <label htmlFor="needsPower" className="flex-1">
            <span className="flex items-center gap-2 text-sm font-medium text-primary-200">
              <Zap className="w-4 h-4 text-gold-400" />
              Needs power outlet
            </span>
            <span className="text-sm text-primary-400 mt-0.5 block">
              Check this if your entry needs to stay warm with a slow cooker or hot plate
            </span>
          </label>
        </div>

        {/* Notes for organizers */}
        <div>
          <label htmlFor="notes" className="flex items-center gap-2 text-sm font-medium text-primary-200 mb-2">
            <MessageSquare className="w-4 h-4 text-gold-400" />
            Notes for Organizers
            <span className="text-primary-500 font-normal">(optional)</span>
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            defaultValue={entry?.notes ?? ""}
            placeholder="Any special requirements? Extra table space, specific serving utensils, dietary info, etc."
            className="w-full px-4 py-3 bg-primary-800/50 border border-primary-600 rounded-lg text-white placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <Button type="submit" variant="primary">
            {isEditing ? "Update Entry" : "Submit Entry"}
          </Button>
          <a
            href={isEditing ? "/my-entry" : "/entries"}
            className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-primary-300 hover:text-white transition-colors"
          >
            Cancel
          </a>
        </div>
      </form>
    </Card>
  );
}
