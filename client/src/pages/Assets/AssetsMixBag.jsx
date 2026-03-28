import Card from "../../components/Card";
import WidgetSection from "../../components/WidgetSection";

const AssetsMixBag = () => {
    const routes = [
        {
            title: "vender",
            route: "/app/assets/mix-bag/vender",
        },
    ];

    return (
        <div className="p-4 flex flex-col gap-4">
            <div className="h-[50vh] uppercase">
                <WidgetSection key={routes.length} layout={2} padding>
                    {routes.map((route, index) => (
                        <Card fullHeight key={index} title={route.title} route={route.route} />
                    ))}
                </WidgetSection>
            </div>
        </div>
    );
};

export default AssetsMixBag;