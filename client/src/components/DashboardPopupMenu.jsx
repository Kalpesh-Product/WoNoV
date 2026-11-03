import { createElement, isValidElement, useCallback, useState } from "react";
import { Menu } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { FiChevronRight, FiGrid, FiX } from "react-icons/fi";
import { MdKeyboardArrowDown } from "react-icons/md";

const renderIcon = (icon) => {
  if (!icon) return null;
  return isValidElement(icon) ? icon : createElement(icon, { "aria-hidden": true });
};

const DashboardPopupMenu = ({ cards = [], moduleLabel = "Dashboard" }) => {
  const navigate = useNavigate();
  const [anchor, setAnchor] = useState(null);
  const [activeCardTitle, setActiveCardTitle] = useState(null);
  const activeCard =
    cards.find((card) => card.title === activeCardTitle) || cards[0];

  const navigateFromMenu = useCallback(
    (route) => {
      setAnchor(null);
      navigate(route, { flushSync: true });
    },
    [navigate],
  );

  if (!cards.length) return null;

  return (
    <>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        keepMounted
        transitionDuration={{ enter: 80, exit: 0 }}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{
          paper: {
            sx: {
              width: { xs: "calc(100vw - 24px)", sm: 680 },
              maxWidth: "calc(100vw - 24px)",
              borderRadius: 2,
              border: "1px solid #e0e8f5",
              mt: 1,
            },
          },
        }}
      >
        <div className="relative grid grid-cols-1 sm:grid-cols-[220px_minmax(0,1fr)]">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setAnchor(null)}
            className="absolute -top-2 right-0 z-20 flex h-7 w-7 items-center justify-center bg-transparent text-[#1E3D73] transition hover:bg-[#ff7777] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b8d2f5]"
          >
            <FiX size={17} aria-hidden="true" />
          </button>
          <div className="border-b border-[#e2eaf5] bg-[#f8fbff] p-2 sm:border-b-0 sm:border-r">
            {cards.map((card) => (
              <button
                key={card.title}
                type="button"
                onClick={() => setActiveCardTitle(card.title)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left font-pmedium text-sm text-[#1E3D73] transition ${activeCard?.title === card.title ? "bg-[#e7f1ff]" : "hover:bg-[#eef5ff]"}`}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e8f1ff] text-lg">
                  {renderIcon(card.icon)}
                </span>
                <span className="min-w-0 flex-1 leading-tight">{card.title}</span>
                <FiChevronRight className="shrink-0" size={17} />
              </button>
            ))}
          </div>
          <div className="relative min-h-[260px] p-4 sm:p-5">
            {activeCard && (
              <>
                {activeCard.openRoute ? (
                  <button
                    type="button"
                    onClick={() => navigateFromMenu(activeCard.openRoute)}
                    className="mb-3 block w-full rounded-xl text-left transition hover:ring-1 hover:ring-[#d8e5f7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b8d2f5]"
                    aria-label={`Open ${activeCard.title}`}
                  >
                    <div className="flex items-center gap-3 rounded-xl bg-[#f4f8ff] p-3 pr-10">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e3efff] text-xl text-[#1E3D73]">
                        {renderIcon(activeCard.icon)}
                      </span>
                      <div>
                        <p className="font-psemibold text-base text-[#1E3D73]">{activeCard.title}</p>
                        <p className="text-xs text-[#7084a4]">Open {moduleLabel} modules</p>
                      </div>
                    </div>
                  </button>
                ) : (
                  <div className="mb-3 flex items-center gap-3 rounded-xl bg-[#f4f8ff] p-3 pr-10">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e3efff] text-xl text-[#1E3D73]">
                      {renderIcon(activeCard.icon)}
                    </span>
                    <div>
                      <p className="font-psemibold text-base text-[#1E3D73]">{activeCard.title}</p>
                      <p className="text-xs text-[#7084a4]">Open {moduleLabel} modules</p>
                    </div>
                  </div>
                )}
                <div className="max-h-[340px] divide-y divide-[#edf1f7] overflow-y-auto pr-1">
                  {activeCard.items?.length ? (
                    activeCard.items.map((item) => (
                      <button
                        key={`${item.route}-${item.label}`}
                        type="button"
                        onClick={() => navigateFromMenu(item.route)}
                        className="flex w-full items-center gap-3 rounded-lg px-2 py-3 text-left text-[#294a7d] hover:bg-[#f7faff]"
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#edf4ff] text-[#1E3D73]">
                          {renderIcon(item.icon || activeCard.icon)}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-pmedium text-[15px] leading-tight">{item.label}</span>
                          {item.description && (
                            <span className="mt-1 block text-xs leading-tight text-[#7b8eac]">{item.description}</span>
                          )}
                        </span>
                        <FiChevronRight className="shrink-0" size={17} />
                      </button>
                    ))
                  ) : (
                    <p className="px-2 py-6 text-center text-sm text-[#7b8eac]">No sub-modules available</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </Menu>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={Boolean(anchor)}
        onClick={(event) => setAnchor(event.currentTarget)}
        className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-[#C8DCFA] bg-[#EEF5FF] px-3 py-2 font-pmedium text-xs text-[#123B82] shadow-sm focus-visible:outline-none sm:text-sm"
      >
        <FiGrid className="text-lg sm:text-xl" aria-hidden="true" />
        <span>Menu</span>
        <MdKeyboardArrowDown className="text-lg" aria-hidden="true" />
      </button>
    </>
  );
};

export default DashboardPopupMenu;
