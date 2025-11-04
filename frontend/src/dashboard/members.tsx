import { Loader } from "../components/loader";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { useGetWorkspaceDetailsQuery } from "../hooks/use-workspace";
import type { Workspace } from "../types";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const Members = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const workspaceId = searchParams.get("workspaceId");
    const initialSearch = searchParams.get("search") || "";
    const [search, setSearch] = useState<string>(initialSearch);

    useEffect(() => {
        const params: Record<string, string> = {};

        searchParams.forEach((value, key) => {
            params[key] = value;
        });

        params.search = search;

        setSearchParams(params, { replace: true });
    }, [search]);

    useEffect(() => {
        const urlSearch = searchParams.get("search") || "";
        if (urlSearch !== search) setSearch(urlSearch);
    }, [searchParams]);

    const { data, isLoading } = useGetWorkspaceDetailsQuery(workspaceId!) as {
        data: Workspace;
        isLoading: boolean;
    };

    if (isLoading)
        return (
            <div>
                <Loader />
            </div>
        );

    if (!data || !workspaceId) return <div>Aucun espace de travail trouvé</div>;

    const filteredMembers = data?.members?.filter(
        (member) =>
            member.user.name.toLowerCase().includes(search.toLowerCase()) ||
            member.user.email.toLowerCase().includes(search.toLowerCase()) ||
            member.role?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-start md:items-center justify-between">
                <h1 className="text-2xl font-bold">Membres de l’espace de travail</h1>
            </div>

            <Input
                placeholder="Rechercher un membre..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-md"
            />

            <Tabs defaultValue="list">
                <TabsList>
                    <TabsTrigger value="list">Vue Liste</TabsTrigger>
                    <TabsTrigger value="board">Vue Grille</TabsTrigger>
                </TabsList>

                {/* ✅ VUE LISTE */}
                <TabsContent value="list">
                    <Card>
                        <CardHeader>
                            <CardTitle>Membres</CardTitle>
                            <CardDescription>
                                {filteredMembers?.length} membre
                                {filteredMembers?.length > 1 ? "s" : ""} dans votre espace de
                                travail
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <div className="divide-y">
                                {filteredMembers.map((member) => (
                                    <div
                                        key={member.user._id}
                                        className="flex flex-col md:flex-row items-center justify-between p-4 gap-3"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <Avatar className="bg-gray-500">
                                                <AvatarImage src={member.user.profilePictureUrl} />
                                                <AvatarFallback>
                                                    {member.user.name.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{member.user.name}</p>
                                                <p className="text-sm text-gray-500">
                                                    {member.user.email}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-1 ml-11 md:ml-0">
                                            <Badge
                                                variant={
                                                    ["admin", "owner"].includes(member.role)
                                                        ? "destructive"
                                                        : "secondary"
                                                }
                                                className="capitalize"
                                            >
                                                {member.role === "owner"
                                                    ? "Propriétaire"
                                                    : member.role === "admin"
                                                        ? "Administrateur"
                                                        : member.role === "member"
                                                            ? "Membre"
                                                            : "Invité"}
                                            </Badge>

                                            <Badge variant={"outline"}>{data.name}</Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ✅ VUE GRILLE */}
                <TabsContent value="board">
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredMembers.map((member) => (
                            <Card key={member.user._id}>
                                <CardContent className="p-6 flex flex-col items-center text-center">
                                    <Avatar className="bg-gray-500 size-20 mb-4">
                                        <AvatarImage src={member.user.profilePictureUrl} />
                                        <AvatarFallback className="uppercase">
                                            {member.user.name.substring(0, 2)}
                                        </AvatarFallback>
                                    </Avatar>

                                    <h3 className="text-lg font-medium mb-2">
                                        {member.user.name}
                                    </h3>

                                    <p className="text-sm text-gray-500 mb-4">
                                        {member.user.email}
                                    </p>

                                    <Badge
                                        variant={
                                            ["admin", "owner"].includes(member.role)
                                                ? "destructive"
                                                : "secondary"
                                        }
                                    >
                                        {member.role === "owner"
                                            ? "Propriétaire"
                                            : member.role === "admin"
                                                ? "Administrateur"
                                                : member.role === "member"
                                                    ? "Membre"
                                                    : "Invité"}
                                    </Badge>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default Members;
