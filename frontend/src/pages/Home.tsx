import { Switch, Route } from "react-router-dom";
import { OwleerContainer } from "../container/Container";
import Integrations from "./integrations/Integrations";
import Projects from "./projects/Projects";
import Settings from "./settings/Settings";
import { OrganizationInfoPage } from "./organizations/OrganizationInfoPage";
import Organizations from "./organizations/Organizations";
import Files from "./files/Files";
import Profile from "./profile/Profile";
import Dashboard from "./dashboard/Dashboard";
import CreateOrganization from "./create_organization/CreateOrganization";
import { ProjectFilesPage } from "./projects/project_files/ProjectFilesPage";
import CreateOrder from "./printery/CreateOrder";
import { MailTracker } from "./mail-tracker/MailTracker";
import { EventFeed } from "./event-feed/EventFeed";
import ConnectMondayCallback from "./integrations/monday/ConnectMondayCallback";
import Monday from "./integrations/monday/Monday";
import MondayBoard from "./integrations/monday/board/Board";
import { ProjectOrderPrintery } from "./printery/order_printery/OrderStatusPage";
import { MyOrderPage } from "./printery/order_printery/MyOrderPage";
import { OrderView } from "./printery/order_view/OrderView";
import { ZoomIntegrationPage } from "./zoom-integration/zoomIntegrationPage";

export default function Home() {
  return (
    <div>
      <OwleerContainer>
        <Switch>
          <Route exact path={["/", "/projects"]} component={Projects} />
          <Route exact path="/organizations" component={Organizations} />
          <Route
            exact
            path="/create_organization"
            component={CreateOrganization}
          />
          <Route exact path="/files" component={Files} />
          <Route exact path="/files/:id" component={ProjectFilesPage} />
          <Route exact path="/files/:id/version/:id" component={ProjectFilesPage} />
          <Route
            exact
            path="/organizations/:id"
            component={OrganizationInfoPage}
          />
          <Route exact path="/profile" component={Profile} />
          <Route exact path="/integrations" component={Integrations} />
          <Route exact path="/integrations/monday" component={Monday} />
          <Route
            exact
            path="/integrations/monday/board/:board_id"
            component={MondayBoard}
          />
          <Route
            exact
            path="/integrations/monday/callback"
            component={ConnectMondayCallback}
          />
          <Route
            exact
            path="/integrations/zoom"
            component={ZoomIntegrationPage}
          />
          <Route exact path="/dashboard" component={Dashboard} />
          <Route exact path="/feed" component={EventFeed} />
          <Route exact path="/settings" component={Settings} />
          <Route exact path="/create-order" component={CreateOrder} />
          <Route
            exact
            path="/project-order-printery"
            component={ProjectOrderPrintery}
          />
          <Route exact path="/my-order-printery" component={MyOrderPage} />
          <Route exact path="/order/:id" component={OrderView} />
          <Route exact path="/mail-tracker" component={MailTracker} />
        </Switch>
      </OwleerContainer>
    </div>
  );
}
