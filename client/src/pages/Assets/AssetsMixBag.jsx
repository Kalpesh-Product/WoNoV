import Card from "../../components/Card";
import WidgetSection from "../../components/WidgetSection";
import { PERMISSIONS } from "../../constants/permissions";
import useAuth from "../../hooks/useAuth";

const AssetsMixBag = () => {
    const { auth } = useAuth();
    const userPermissions = auth?.user?.permissions?.permissions || [];
    const routes = [
        {
            title: "vender",
            route: "/app/assets/mix-bag/vender",
            permission: PERMISSIONS.ASSETS_MIX_BAG_VENDER.value,
        },
    ];

    return (
        <div className="p-4 flex flex-col gap-4">
            <div className="h-[50vh] uppercase">
                <WidgetSection key={routes.length} layout={2} padding>
                    {routes.map((route, index) => (
                        userPermissions.includes(route.permission) && (
                            <Card fullHeight key={index} title={route.title} route={route.route} />
                        )
                    ))}
                </WidgetSection>
            </div>
        </div>
    );
};

export default AssetsMixBag;