import { BackButton } from "../components/back-button";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Button } from "../components/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../components/ui/Card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "../components/ui/form";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";
import {
    useChangePassword,
    useUpdateUserProfile,
    useUserProfileQuery,
} from "../hooks/use-user";
import { useAuth } from "../fournisseur/auth-context";
import type { Utilisateur } from "../types";
import { AlertCircle, Loader, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const changePasswordSchema = z
    .object({
        currentPassword: z
            .string()
            .min(1, { message: "Le mot de passe actuel est requis" }),
        newPassword: z.string().min(8, { message: "Le mot de passe est requis" }),
        confirmPassword: z
            .string()
            .min(8, { message: "La confirmation du mot de passe est requise" }),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Les mots de passe ne correspondent pas",
        path: ["confirmPassword"],
    });

const profileSchema = z.object({
    name: z.string().min(1, { message: "Le nom est requis" }),
    profilePicture: z.string().optional(),
});

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export type ProfileFormData = z.infer<typeof profileSchema>;

const Profile = () => {
    const { data: user, isPending } = useUserProfileQuery() as {
        data: Utilisateur;
        isPending: boolean;
    };
    const { logout } = useAuth();
    const navigate = useNavigate();

    const form = useForm<ChangePasswordFormData>({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });
    const profileForm = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: user?.name || "",
            profilePicture: user?.profilePictureUrl || "",
        },
    });

    const { mutate: updateUserProfile, isPending: isUpdatingProfile } =
        useUpdateUserProfile();
    const {
        mutate: changePassword,
        isPending: isChangingPassword,
        error,
    } = useChangePassword();

    const handlePasswordChange = (values: ChangePasswordFormData) => {
        changePassword(values, {
            onSuccess: () => {
                toast.success(
                    "Mot de passe mis à jour avec succès. Vous serez déconnecté. Veuillez vous reconnecter."
                );
                form.reset();

                setTimeout(() => {
                    logout();
                    navigate("/sign-in");
                }, 3000);
            },
            onError: (error: any) => {
                const errorMessage =
                    error.response?.data?.error || "Échec de la mise à jour du mot de passe";
                toast.error(errorMessage);
                console.log(error);
            },
        });
    };

    const handleProfileFormSubmit = (values: ProfileFormData) => {
        updateUserProfile(
            { name: values.name, profilePicture: values.profilePicture || "" },
            {
                onSuccess: () => {
                    toast.success("Profil mis à jour avec succès");
                },
                onError: (error: any) => {
                    const errorMessage =
                        error.response?.data?.error || "Échec de la mise à jour du profil";
                    toast.error(errorMessage);
                    console.log(error);
                },
            }
        );
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                profileForm.setValue("profilePicture", reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    if (isPending)
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader className="animate-spin" />
            </div>
        );

    return (
        <div className="space-y-8">
            <div className="px-4 md:px-0">
                <BackButton />
                <h3 className="text-lg font-medium">Informations du profil</h3>
                <p className="text-sm text-muted-foreground">
                    Gérez les paramètres de votre compte et vos préférences.
                </p>
            </div>

            <Separator />

            <Card>
                <CardHeader>
                    <CardTitle>Informations personnelles</CardTitle>
                    <CardDescription>Modifiez vos informations personnelles.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...profileForm}>
                        <form
                            onSubmit={profileForm.handleSubmit(handleProfileFormSubmit)}
                            className="grid gap-4"
                        >
                            <div className="flex items-center space-x-4 mb-6">
                                <Avatar className="h-20 w-20 bg-gray-600">
                                    <AvatarImage
                                        src={
                                            profileForm.watch("profilePicture") ||
                                            user?.profilePictureUrl
                                        }
                                        alt={user?.name}
                                    />
                                    <AvatarFallback className="text-xl">
                                        {user?.name?.charAt(0) || "U"}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <input
                                        id="avatar-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                        style={{ display: "none" }}
                                    />
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                            document.getElementById("avatar-upload")?.click()
                                        }
                                    >
                                        Changer l'avatar
                                    </Button>
                                </div>
                            </div>
                            <FormField
                                control={profileForm.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nom complet</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid gap-2">
                                <Label htmlFor="email">Adresse email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    defaultValue={user?.email}
                                    disabled
                                />
                                <p className="text-xs text-muted-foreground">
                                    Votre adresse email ne peut pas être modifiée.
                                </p>
                            </div>
                            <Button
                                type="submit"
                                className="w-fit"
                                disabled={isUpdatingProfile || isPending}
                            >
                                {isUpdatingProfile ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Enregistrement...
                                    </>
                                ) : (
                                    "Sauvegarder les modifications"
                                )}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Sécurité</CardTitle>
                    <CardDescription>Modifiez votre mot de passe.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(handlePasswordChange)}
                            className="grid gap-4"
                        >
                            {error && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{error.message}</AlertDescription>
                                </Alert>
                            )}

                            <div className="grid gap-2">
                                <FormField
                                    control={form.control}
                                    name="currentPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Mot de passe actuel</FormLabel>
                                            <FormControl>
                                                <Input
                                                    id="current-password"
                                                    type="password"
                                                    placeholder="********"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="newPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nouveau mot de passe</FormLabel>
                                            <FormControl>
                                                <Input
                                                    id="new-password"
                                                    type="password"
                                                    placeholder="********"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Confirmer le mot de passe</FormLabel>
                                            <FormControl>
                                                <Input
                                                    id="confirm-password"
                                                    placeholder="********"
                                                    type="password"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 w-fit"
                                disabled={isPending || isChangingPassword}
                            >
                                {isPending || isChangingPassword ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Mise à jour...
                                    </>
                                ) : (
                                    "Mettre à jour le mot de passe"
                                )}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
};

export default Profile;
