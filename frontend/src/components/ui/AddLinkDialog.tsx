import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "./dialog"; 
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form"; 
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { Link } from "lucide-react"; 

const addLinkSchema = z.object({
  customName: z.string().min(3, "Le nom doit contenir au moins 3 caractères."),
  url: z.string().url("Veuillez entrer une URL valide (ex: https://...)."),
});

type AddLinkFormData = z.infer<typeof addLinkSchema>;


interface AddLinkDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddLink: (url: string, customName: string) => Promise<void>;
}

export const AddLinkDialog = ({
  isOpen,
  onOpenChange,
  onAddLink,
}: AddLinkDialogProps) => {
  const [isAdding, setIsAdding] = useState(false);

  const form = useForm<AddLinkFormData>({
    resolver: zodResolver(addLinkSchema),
    defaultValues: {
      customName: "",
      url: "",
    },
  });

  // Fonction de soumission
  const onSubmit = async (data: AddLinkFormData) => {
    setIsAdding(true);
    try {
      await onAddLink(data.url, data.customName);

      toast.success("Lien ajouté avec succès !");
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de l'ajout du lien.");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter un lien externe</DialogTitle>
          <DialogDescription>
            Ajoutez l'URL et un nom personnalisé pour ce lien.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* --- Champ URL --- */}
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lien (URL)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://votre-lien.com"
                      type="url" 
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* --- Champ Nom Personnalisé --- */}
            <FormField
              control={form.control}
              name="customName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom du lien</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Documentation API" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={isAdding}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isAdding}>
                {isAdding ? "Ajout en cours..." : "Ajouter le lien"}
                {!isAdding && <Link className="w-4 h-4 ml-2" />}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
