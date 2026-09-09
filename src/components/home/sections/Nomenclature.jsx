import { Button, Skeleton, StatusBlock } from '../../ui/index.js';
import { stagger, useSectionMotion } from '../motion.js';
import { Ghost, Placeholder, Rail } from '../parts.jsx';

/*
  Экран 5. Плотное поле позиций в край экрана: без полей вокруг ячеек и без
  воздуха между ними. Единственная плотная секция страницы — плотность здесь
  и есть высказывание, остальные экраны держат воздух.

  Движение — поле набирается строками снизу вверх, как печатается сам лист.

  Позиции приходят из базы. Наименование и направление — настоящие, артикула
  в базе нет, и на его месте стоит заглушка. Цены нет нигде: «Цена по запросу»
  — не оформительский приём, а условие заказчика.
*/

const SKELETON_CELLS = 8;

export function Nomenclature({
  anchor,
  rail,
  ghost,
  title,
  note,
  items,
  loading,
  failed,
  empty,
  error,
  articleLabel,
  priceLabel,
  catalog,
}) {
  const { ref, t } = useSectionMotion({ from: 0.04, to: 0.5 });
  const count = items.length;

  return (
    <section className="kns-section kns-nomenclature" id={anchor} ref={ref}>
      <Rail>{rail}</Rail>
      <Ghost>{ghost}</Ghost>

      <h2 className="kns-heading">{title}</h2>

      {loading && (
        <div className="kns-field" aria-hidden="true">
          {Array.from({ length: SKELETON_CELLS }, (unused, index) => (
            <div className="kns-cell" key={index}>
              <Skeleton className="h-3 w-24" rounded="" />
              <Skeleton className="mt-2 h-4 w-full" rounded="" />
              <Skeleton className="mt-6 h-3 w-20" rounded="" />
            </div>
          ))}
        </div>
      )}

      {!loading && count === 0 && (
        <div className="mt-stack-lg max-w-2xl">
          {/* Не загрузилось и «пока пусто» — разные вещи, и посетитель
              должен видеть, которая из них с ним случилась. */}
          <StatusBlock
            icon={failed ? 'cloud_off' : 'inventory_2'}
            title={failed ? error.title : empty.title}
            text={failed ? error.text : empty.text}
          />
        </div>
      )}

      {!loading && count > 0 && (
        <ul className="kns-field">
          {items.map((item, index) => {
            // Лист печатается снизу вверх: последняя строка набирается первой.
            const typed = stagger(t, count - 1 - index, count, 0.88);

            return (
              <li key={item.slug}>
                <a
                  className="kns-cell h-full"
                  href={`/products/${item.slug}`}
                  style={{
                    opacity: 0.08 + 0.92 * typed,
                    transform: `translateY(${((1 - typed) * 10).toFixed(2)}px)`,
                  }}
                >
                  <span className="kns-cell-article">
                    <Placeholder label={articleLabel} />
                  </span>
                  <span className="kns-cell-name">{item.name}</span>
                  <span className="kns-cell-direction">{item.category}</span>
                  <span className="kns-cell-price">{priceLabel}</span>
                </a>
              </li>
            );
          })}
        </ul>
      )}

      <div className="kns-field-foot">
        <p className="kns-lead text-[15px]">{note}</p>
        <Button href={catalog.href} variant="outline" iconEnd="arrow_forward">
          {catalog.label}
        </Button>
      </div>
    </section>
  );
}
