import type { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { inviteMemberSchema } from "../../libs/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useState } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { Input } from "../ui/input";
import { cn } from "../../lib/utils";

import { Check, Copy, Mail } from "lucide-react";
import { Label } from "../ui/label";
import { useInviteMemberMutation } from "../../hooks/use-workspace";
import { toast } from "sonner";
import { Button } from "../button";

interface InviteMemberDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    workspaceId: string;
}
export type InviteMemberFormData = z.infer<typeof inviteMemberSchema>;

const ROLES = ["admin", "member", "viewer"] as const;

export const InviteMemberDialog = ({
    isOpen,
    onOpenChange,
    workspaceId,
}: InviteMemberDialogProps) => {
    const [inviteTab, setInviteTab] = useState("email");
    const [linkCopied, setLinkCopied] = useState(false);

    const form = useForm<InviteMemberFormData>({
        resolver: zodResolver(inviteMemberSchema),
        defaultValues: {
            email: "",
            role: "member",
        },
    });

    const { mutate, isPending } = useInviteMemberMutation();

    const onSubmit = async (data: InviteMemberFormData) => {
        if (!workspaceId) return;

        mutate(
            {
                workspaceId,
                ...data,
            },
            {
                onSuccess: () => {
                    toast.success("Invitation envoyée avec succès");
                    form.reset();
                    setInviteTab("email");
                    onOpenChange(false);
                },
                onError: (error: any) => {
                    toast.error(error.response.data.message);
                    console.log(error);
                },
            }
        );
    };

    const handleCopyInviteLink = () => {
        navigator.clipboard.writeText(
            `${window.location.origin}/workspace-invite/${workspaceId}`
        );
        setLinkCopied(true);

        setTimeout(() => {
            setLinkCopied(false);
        }, 3000);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Inviter des membres</DialogTitle>
                </DialogHeader>

                <Tabs
                    defaultValue="email"
                    value={inviteTab}
                    onValueChange={setInviteTab}
                >
                    <TabsList>
                        <TabsTrigger value="email" disabled={isPending}>
                            Envoyer un e-mail
                        </TabsTrigger>
                        <TabsTrigger value="link" disabled={isPending}>
                            Partager le lien
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="email">
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col space-y-4 w-full">
                                        <div className="flex items-center gap-4 w-full">
                                            <FormField
                                                control={form.control}
                                                name="email"
                                                render={({ field }) => (
                                                    <FormItem className="flex-1">
                                                        <FormLabel>Adresse e-mail</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} placeholder="Entrez l'e-mail" />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />

                                            <Button
                                                className="w-auto mt-5"
                                                size={"sm"}
                                                disabled={isPending}
                                            >
                                                <Mail className="w-4 h-4 mr-2" />
                                                Envoyer
                                            </Button>
                                        </div>

                                        <FormField
                                            control={form.control}
                                            name="role"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Sélectionner un rôle</FormLabel>
                                                    <FormControl>
                                                        <div className="flex gap-3 flex-wrap">
                                                            {ROLES.map((role) => (
                                                                <label
                                                                    key={role}
                                                                    className="flex items-center cursor-pointer gap-2"
                                                                >
                                                                    <input
                                                                        type="radio"
                                                                        value={role}
                                                                        className="peer hidden"
                                                                        checked={field.value === role}
                                                                        onChange={() => field.onChange(role)}
                                                                    />
                                                                    <span
                                                                        className={cn(
                                                                            "w-5 h-5 rounded-full border-2 border-[#005F73] flex items-center justify-center transition-all duration-300 hover:shadow-lg bg-[#005F73] text-white",
                                                                            field.value === role &&
                                                                            "ring-2 ring-[#005F73] ring-offset-2"
                                                                        )}
                                                                    >
                                                                        {field.value === role && (
                                                                            <span className="w-3 h-3 rounded-full bg-white" />
                                                                        )}
                                                                    </span>
                                                                    <span className="capitalize">
                                                                        {role === "admin" && "Admin"}
                                                                        {role === "member" && "Membre"}
                                                                        {role === "viewer" && "Observateur"}
                                                                    </span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </form>
                                </Form>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="link">
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label>Partagez ce lien pour inviter des personnes</Label>
                                <div className="flex items-center space-x-2">
                                    <Input
                                        readOnly
                                        value={`${window.location.origin}/workspace-invite/${workspaceId}`}
                                    />
                                    <Button onClick={handleCopyInviteLink} disabled={isPending}>
                                        {linkCopied ? (
                                            <>
                                                <Check className="mr-2 h-4 w-4" />
                                                Copié
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="mr-2 h-4 w-4" />
                                                Copier
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Toute personne disposant du lien peut rejoindre cet espace de travail
                            </p>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
};



