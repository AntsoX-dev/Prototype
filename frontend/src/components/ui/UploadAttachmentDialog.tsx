
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
import { UploadCloud } from "lucide-react";

// Schéma Zod pour la validation
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const uploadAttachmentSchema = z.object({
  customName: z.string().min(3, "Le nom doit contenir au moins 3 caractères."),
  file: z
    .instanceof(FileList)
    .refine(
      (files) => files.length === 1,
      "Vous devez sélectionner un fichier."
    )
    .refine(
      (files) => files[0]?.size <= MAX_FILE_SIZE,
      `La taille maximale est 5MB.`
    )
    .refine(
      (files) => ACCEPTED_MIME_TYPES.includes(files[0]?.type),
      "Type de fichier non supporté."
    ),
});

type UploadAttachmentFormData = z.infer<typeof uploadAttachmentSchema>;

interface UploadAttachmentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (file: File, customName: string) => Promise<void>;
}

export const UploadAttachmentDialog = ({
  isOpen,
  onOpenChange,
  onUpload,
}: UploadAttachmentDialogProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<UploadAttachmentFormData>({
    resolver: zodResolver(uploadAttachmentSchema),
    defaultValues: {
      customName: "",
      file: undefined, 
    },
  });

  const fileRef = form.register("file");

  // Fonction de soumission
  const onSubmit = async (data: UploadAttachmentFormData) => {
    setIsUploading(true);
    try {
      const file = data.file[0]; 
      const customName = data.customName;

      await onUpload(file, customName);

      toast.success("Fichier uploadé avec succès !");
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de l'upload.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter une pièce jointe</DialogTitle>
          <DialogDescription>
            Sélectionnez un fichier et donnez-lui un nom.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* --- Champ Fichier --- */}
            <FormField
              control={form.control}
              name="file"
              render={() => (
                <FormItem>
                  <FormLabel>Fichier</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      placeholder="Choisir un fichier"
                      {...fileRef} 
                      onChange={(e) => {
                        fileRef.onChange(e);

                        // 2. Mettre à jour le nom personnalisé
                        const file = e.target.files?.[0];
                        if (file) {
                          form.setValue("customName", file.name, {
                            shouldValidate: true,
                          });
                        }
                      }}
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
                  <FormLabel>Nom personnalisé du fichier</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Facture_Janvier_2024.pdf"
                      {...field}
                    />
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
                disabled={isUploading}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isUploading}>
                {isUploading ? "Upload en cours..." : "Uploader le fichier"}
                {!isUploading && <UploadCloud className="w-4 h-4 ml-2" />}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
