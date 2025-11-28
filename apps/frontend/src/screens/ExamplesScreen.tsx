import React from "react";
import { TimerButtonExamples } from "./TimerButtonExamples";
import { Button, Skeleton } from "@components/ui";
import { modal } from "@helpers/modal";

export const ExamplesScreen: React.FC = () => {
  const handleShowLoading = () => {
    modal.showLoading("Procesando información...");
    setTimeout(() => {
      modal.success({
        title: "¡Éxito!",
        description: "La máquina se ha registrado correctamente.",
        dismissText: "Continuar",
      });
      // console.log("Cerrando modal de éxito automáticamente.");
      setTimeout(() => {
        modal.hide();
      }, 2000);
    }, 2000);
  };

  const handleShowSuccess = () => {
    modal.showFeedback({
      variant: "success",
      title: "Operación exitosa",
      description: "Los datos se han guardado correctamente.",
      actionLabel: "¡Listo!",
      showCancel: false,
    });
  };

  const handleShowWarning = () =>
    modal.showFeedback({
      variant: "warning",
      title: "Revisa esta acción",
      description: "Algunos campos podrían requerir doble verificación.",
      actionLabel: "Entendido",
    });

  const handleShowError = () =>
    modal.showFeedback({
      variant: "danger",
      title: "Error inesperado",
      description: "No se pudo completar la solicitud. Inténtalo de nuevo.",
      actionLabel: "Cerrar",
    });

  const handleShowCustom = () =>
    modal.show({
      title: "Modal personalizado",
      description:
        "Este modal usa la configuración tradicional con botones propios.",
      content: (
        <div className="text-sm text-muted-foreground">
          Aquí podrías renderizar formularios, listas u otro contenido
          específico.
        </div>
      ),
      showConfirm: true,
      showCancel: true,
      confirmText: "Continuar",
      cancelText: "Cancelar",
      variant: "success", // "success", "warning", "danger", "info", "default"
      showColoredBorder: true,
    });

  return (
    <div className="space-y-8 px-6 py-8 max-w-5xl mx-auto">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">
          Pantalla de Ejemplos
        </h1>
        <p className="text-muted-foreground">
          Usa estos controles para probar los distintos modales y componentes
          UI.
        </p>
      </header>

      <section className="bg-card rounded-lg shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">
          Modales de feedback
        </h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onPress={handleShowLoading}>
            Loading modal
          </Button>
          <Button variant="success" onPress={handleShowSuccess}>
            Success modal
          </Button>
          <Button variant="warning" onPress={handleShowWarning}>
            Warning modal
          </Button>
          <Button variant="destructive" onPress={handleShowError}>
            Error modal
          </Button>
          <Button variant="filled" onPress={handleShowCustom}>
            Modal personalizado
          </Button>
        </div>
        {/* Comentario estratégico: se podría añadir aquí un ejemplo de modal.confirm para mostrar confirmaciones nativas. */}
      </section>

      <section className="bg-card rounded-lg shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">
          TimerButton & Skeleton demos
        </h2>
        <TimerButtonExamples />
        <div className="flex gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
      </section>
    </div>
  );
};
