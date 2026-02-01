import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Heading1, Heading2, BodyText, Button, Card } from "@components/ui";
import { AlertCircle, ArrowLeft, MoreVertical } from "lucide-react";
import { formatDateLong } from "@utils";
import {
  CreateEditSparePartModal,
  SparePartOptionsModal,
  DeleteConfirmModal,
} from "@components/spare-parts";
import { useSparePartDetailViewModel } from "../../viewModels/spare-parts";

/**
 * SparePartDetailScreen (View Layer - MVVM)
 *
 * Sprint #15/16 Task 7.1: Displays detailed information about a single spare part.
 * Shows: name, serialId, amount, timestamps, and related metadata.
 * Allows editing and deleting the part.
 *
 * Architecture:
 * - View Layer: Only rendering and UI structure (this file)
 * - Business Logic: Handled by useSparePartDetailViewModel
 * - Data Layer: API calls via sparePartService
 *
 * Navigation:
 * - Back button returns to spare parts list
 * - Delete action navigates back to list after success
 *
 * Pattern:
 * - Consumes ViewModel via useSparePartDetailViewModel(sparePartId)
 * - NO business logic in this component
 * - Renders based on ViewModel state/data/actions
 *
 * @example
 * ```tsx
 * // Route: /machines/:id/spare-parts/:sparePartId
 * <Route path="/machines/:id/spare-parts/:sparePartId" element={<SparePartDetailScreen />} />
 * ```
 */
export function SparePartDetailScreen() {
  const { id: machineId, sparePartId } = useParams<{
    id: string;
    sparePartId: string;
  }>();
  const navigate = useNavigate();
  const { i18n } = useTranslation();

  // ========================
  // ViewModel (Business Logic)
  // ========================

  const vm = useSparePartDetailViewModel(machineId, sparePartId);

  // ========================
  // RENDER SECTIONS
  // ========================

  // Determine which content to show based on state
  let content;

  // ========================
  // ERROR STATE
  // ========================

  if (vm.state.error) {
    content = (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onPress={() => navigate(`/machines/${machineId}/spare-parts`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {vm.t("common.back")}
          </Button>
        </div>

        <Card className="p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <BodyText className="text-destructive">
              {vm.t("common.error")}
            </BodyText>
            <BodyText size="small" className="text-muted-foreground">
              {vm.state.error}
            </BodyText>
            <Button variant="outline" onPress={vm.actions.handleRetry}>
              {vm.t("common.retry")}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ========================
  // LOADING STATE
  // ========================
  else if (vm.state.isLoading) {
    content = (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onPress={() => navigate(`/machines/${machineId}/spare-parts`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {vm.t("common.back")}
          </Button>
        </div>

        <div className="space-y-4">
          <div className="h-12 w-64 bg-muted animate-pulse rounded-lg" />
          <div className="h-96 bg-muted animate-pulse rounded-lg" />
        </div>
      </div>
    );
  }

  // ========================
  // NOT FOUND STATE
  // ========================
  else if (!vm.data.sparePart) {
    content = (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onPress={() => navigate(`/machines/${machineId}/spare-parts`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {vm.t("common.back")}
          </Button>
        </div>

        <Card className="p-12">
          <div className="flex flex-col items-center text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-muted-foreground" />
            <Heading1 size="headline" className="text-foreground">
              {vm.t("spareParts.notFound.title")}
            </Heading1>
            <BodyText className="text-muted-foreground">
              {vm.t("spareParts.notFound.description")}
            </BodyText>
            <Button
              variant="outline"
              onPress={() => navigate(`/machines/${machineId}/spare-parts`)}
            >
              {vm.t("spareParts.notFound.action")}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ========================
  // MAIN RENDER (Spare Part Details)
  // ========================
  else {
    const part = vm.data.sparePart;

    // Format dates for display
    const createdDate = formatDateLong(part.createdAt, i18n.language);
    const updatedDate = formatDateLong(part.updatedAt, i18n.language);

    content = (
      <div className="space-y-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/machines" className="hover:text-foreground">
            {vm.t("machines.breadcrumb.machines")}
          </Link>
          <span>/</span>
          <Link to={`/machines/${machineId}`} className="hover:text-foreground">
            {vm.t("machines.breadcrumb.detail")}
          </Link>
          <span>/</span>
          <Link
            to={`/machines/${machineId}/spare-parts`}
            className="hover:text-foreground"
          >
            {vm.t("spareParts.breadcrumb")}
          </Link>
          <span>/</span>
          <span className="text-foreground truncate max-w-xs">{part.name}</span>
        </div>

        {/* Header with Actions */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
          <div>
            <Heading1
              size="headline"
              className="tracking-tight text-foreground mb-2"
            >
              {part.name}
            </Heading1>
            <BodyText className="text-muted-foreground">
              {vm.t("spareParts.detail.subtitle")}
            </BodyText>
          </div>

          {/* Back Button */}
          <div className="flex items-center justify-between gap-3 w-full">
            <Button variant="outline" onPress={vm.actions.handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {vm.t("common.back")}
            </Button>
            <Button variant="filled" onPress={vm.actions.handleOpenOptions}>
              {vm.t("common.actions")}
              <MoreVertical className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Main Details Card */}
        <Card className="p-6">
          <div className="space-y-6">
            {/* Primary Information */}
            <div>
              <Heading2 size="large" weight="bold" className="mb-4">
                {vm.t("spareParts.detail.primaryInfo")}
              </Heading2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <BodyText size="small" className="text-muted-foreground mb-1">
                    {vm.t("spareParts.form.name")}
                  </BodyText>
                  <BodyText weight="medium" className="text-foreground">
                    {part.name}
                  </BodyText>
                </div>

                {/* Serial ID */}
                <div>
                  <BodyText size="small" className="text-muted-foreground mb-1">
                    {vm.t("spareParts.form.serialId")}
                  </BodyText>
                  <BodyText weight="medium" className="text-foreground">
                    {part.serialId}
                  </BodyText>
                </div>

                {/* Amount */}
                <div>
                  <BodyText size="small" className="text-muted-foreground mb-1">
                    {vm.t("spareParts.form.amount")}
                  </BodyText>
                  <BodyText weight="medium" className="text-foreground">
                    {part.amount} {vm.t("spareParts.units")}
                  </BodyText>
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div className="pt-6 border-t border-border">
              <Heading2 size="large" weight="bold" className="mb-4">
                {vm.t("spareParts.detail.metadata")}
              </Heading2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Created Date */}
                <div>
                  <BodyText size="small" className="text-muted-foreground mb-1">
                    {vm.t("common.createdAt")}
                  </BodyText>
                  <BodyText className="text-foreground">{createdDate}</BodyText>
                </div>

                {/* Last Updated */}
                <div>
                  <BodyText size="small" className="text-muted-foreground mb-1">
                    {vm.t("common.updatedAt")}
                  </BodyText>
                  <BodyText className="text-foreground">{updatedDate}</BodyText>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* POST-MVP: Additional sections can go here */}
        {/*
         * - Usage history (when part was used in maintenance)
         * - Related maintenance alarms
         * - Photo gallery
         * - QR code for physical inventory
         * - Purchase history
         * - Notes/comments
         */}
      </div>
    );
  }

  // ========================
  // RETURN MAIN LAYOUT
  // ========================

  return (
    <div className="space-y-6">
      {content}

      {/* Modals */}
      <CreateEditSparePartModal {...vm.modals.edit} />
      <SparePartOptionsModal {...vm.modals.options} />
      <DeleteConfirmModal {...vm.modals.deleteConfirm} />
    </div>
  );
}

// 🔮 POST-MVP: Strategic enhancements (commented)

/**
 * TODO (v0.0.2): Add usage history section
 * - Timeline of when part was used
 * - Link to maintenance alarms/events
 * - Usage frequency chart
 *
 * UI Addition:
 * <Card className="p-6">
 *   <Heading2>{vm.t('spareParts.detail.usageHistory')}</Heading2>
 *   <div className="space-y-3 mt-4">
 *     {usageHistory.map(usage => (
 *       <div key={usage.id} className="flex justify-between items-center p-3 bg-muted/50 rounded">
 *         <div>
 *           <BodyText weight="medium">{usage.eventType}</BodyText>
 *           <BodyText size="small" className="text-muted-foreground">
 *             {format(usage.date, 'PPP')}
 *           </BodyText>
 *         </div>
 *         <BodyText>-{usage.amountUsed} units</BodyText>
 *       </div>
 *     ))}
 *   </div>
 * </Card>
 */

/**
 * TODO (v0.0.3): Add photo gallery section
 * - Upload multiple photos
 * - View full-screen gallery
 * - Set primary photo
 *
 * UI Addition:
 * <Card className="p-6">
 *   <Heading2>{vm.t('spareParts.detail.photos')}</Heading2>
 *   <div className="grid grid-cols-3 gap-4 mt-4">
 *     {photos.map(photo => (
 *       <div key={photo.id} className="aspect-square rounded-lg overflow-hidden cursor-pointer">
 *         <img src={photo.url} alt={photo.alt} className="w-full h-full object-cover" />
 *       </div>
 *     ))}
 *     <Button variant="outline" className="aspect-square">
 *       <Plus className="h-6 w-6" />
 *     </Button>
 *   </div>
 * </Card>
 */

/**
 * TODO (v0.0.4): Add QR code section
 * - Display QR code for physical inventory
 * - Download as image
 * - Print label
 *
 * UI Addition:
 * <Card className="p-6">
 *   <Heading2>{vm.t('spareParts.detail.qrCode')}</Heading2>
 *   <div className="flex flex-col items-center gap-4 mt-4">
 *     <QRCode value={`sparePart:${part.id}`} size={200} />
 *     <div className="flex gap-2">
 *       <Button variant="outline" onPress={handleDownloadQR}>
 *         <Download className="h-4 w-4 mr-2" />
 *         {vm.t('common.download')}
 *       </Button>
 *       <Button variant="outline" onPress={handlePrintQR}>
 *         <Printer className="h-4 w-4 mr-2" />
 *         {vm.t('common.print')}
 *       </Button>
 *     </div>
 *   </div>
 * </Card>
 */

/**
 * TODO (v0.0.5): Add related parts section
 * - Suggest compatible parts (same machine type)
 * - Show frequently co-used parts
 * - Quick add to inventory
 *
 * UI Addition:
 * <Card className="p-6">
 *   <Heading2>{vm.t('spareParts.detail.relatedParts')}</Heading2>
 *   <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
 *     {relatedParts.map(related => (
 *       <div key={related.id} className="flex justify-between items-center p-3 border rounded-lg">
 *         <div>
 *           <BodyText weight="medium">{related.name}</BodyText>
 *           <BodyText size="small" className="text-muted-foreground">{related.serialId}</BodyText>
 *         </div>
 *         <Button size="sm" variant="ghost" onPress={() => handleAddRelated(related.id)}>
 *           <Plus className="h-4 w-4" />
 *         </Button>
 *       </div>
 *     ))}
 *   </div>
 * </Card>
 */

/**
 * TODO (v0.0.6): Add purchase history section
 * - Track when parts were purchased
 * - Supplier information
 * - Price history
 * - Next reorder date
 *
 * UI Addition:
 * <Card className="p-6">
 *   <Heading2>{vm.t('spareParts.detail.purchaseHistory')}</Heading2>
 *   <div className="space-y-3 mt-4">
 *     {purchaseHistory.map(purchase => (
 *       <div key={purchase.id} className="flex justify-between items-center p-3 bg-muted/50 rounded">
 *         <div>
 *           <BodyText weight="medium">{purchase.supplier}</BodyText>
 *           <BodyText size="small" className="text-muted-foreground">
 *             {format(purchase.date, 'PPP')}
 *           </BodyText>
 *         </div>
 *         <div className="text-right">
 *           <BodyText weight="medium">${purchase.unitCost}</BodyText>
 *           <BodyText size="small" className="text-muted-foreground">
 *             {purchase.quantity} units
 *           </BodyText>
 *         </div>
 *       </div>
 *     ))}
 *   </div>
 * </Card>
 */
