// Skeleton loader documentation

Uso básico:

```jsx
import { Skeleton } from '@components/ui/Skeleton';
<Skeleton className="h-6 w-32 rounded" />
Puedes usarlo en listas, cards, formularios, avatares, etc. Ejemplo:
<div className="flex gap-4">
	<Skeleton className="h-10 w-10 rounded-full" />
	<div className="flex-1 space-y-2">
		<Skeleton className="h-4 w-1/2" />
		<Skeleton className="h-4 w-1/3" />
	</div>
</div>

El color y animación se adaptan automáticamente al modo claro/oscuro.

Para listas:
{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-6 w-full mb-2" />)}

Para cards:
<Skeleton className="h-40 w-full rounded-lg" />

Puedes combinarlo con lógica de loading:
{isLoading ? <Skeleton className="h-6 w-32" /> : <span>Dato real</span>}
```
