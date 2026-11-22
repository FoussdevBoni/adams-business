import { CmsPage } from './components/CmsPage';
import { QuotationRequest } from '../../modules/quotations/components/QuotationRequest';

export function QuotationRequestPage() {
  return (
    <CmsPage pageKey="quotation-request" fallbackTitle="Votre panier" heroVariant="compact">
      <div className="shop-shell pb-12">
        <QuotationRequest />
      </div>
    </CmsPage>
  );
}
