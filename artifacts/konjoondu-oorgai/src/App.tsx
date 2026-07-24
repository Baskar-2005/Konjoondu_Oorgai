import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import Home from '@/pages/Home';
import ProductsPage from '@/pages/Products';
import AdminPage from '@/pages/Admin';
import AccountPage from '@/pages/Account';
import TrackOrder from '@/pages/TrackOrder';
import StationPage from '@/pages/Station';
import StationManager from '@/pages/StationManager';
import { Route, Switch, Router as WouterRouter, useParams } from 'wouter';
import { CartProvider } from '@/context/CartContext';
import { CustomerProvider } from '@/context/CustomerContext';
import CartDrawer from '@/components/CartDrawer';

const queryClient = new QueryClient();

function TrackOrderPage() {
  const params = useParams<{ orderId: string }>();
  return <TrackOrder orderId={params.orderId ?? ''} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/products" component={ProductsPage} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/account" component={AccountPage} />
      <Route path="/track/:orderId" component={TrackOrderPage} />
      <Route path="/station" component={StationPage} />
      <Route path="/station/manager" component={StationManager} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CartProvider>
          <CustomerProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
              <Router />
            </WouterRouter>
            {/* CartDrawer lives outside the router so it's present on all pages */}
            <CartDrawer />
            <Toaster />
          </CustomerProvider>
        </CartProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
