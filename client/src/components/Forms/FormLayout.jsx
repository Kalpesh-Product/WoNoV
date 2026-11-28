import React from "react";
import { CircularProgress } from "@mui/material";
import { LuRotateCcw, LuSave, LuSend } from "react-icons/lu";
import PageFrame from "../Pages/PageFrame";
import "./FormLayout.css";

export const FormLayout = ({ title, icon: Icon, onSubmit, actions, children }) => (
  <div className="shared-form-page">
    <PageFrame className="shared-form-frame">
      <div className="shared-form-shell">
        <header className="shared-form-hero">
          {Icon ? (
            <div className="shared-form-hero-icon" aria-hidden="true">
              <Icon />
            </div>
          ) : null}
          <h1>{title}</h1>
        </header>

        <form onSubmit={onSubmit} className="shared-form">
          <div className="shared-form-section-grid">{children}</div>
          {actions}
        </form>
      </div>
    </PageFrame>
  </div>
);

export const FormSection = ({
  title,
  icon: Icon,
  bodyClassName = "",
  columns = 1,
  fullWidth = false,
  fullWidthLastChild = false,
  children,
}) => {
  const bodyClasses = [
    "shared-form-card-body",
    columns === 2 ? "shared-form-card-body--two-columns" : "",
    columns === 3 ? "shared-form-card-body--three-columns" : "",
    fullWidthLastChild
      ? "shared-form-card-body--full-width-last-child"
      : "",
    bodyClassName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section
      className={`shared-form-section${fullWidth ? " shared-form-section--full-width" : ""}`}
    >
      <div className="shared-form-section-heading">
        {Icon ? <Icon aria-hidden="true" /> : null}
        <h2>{title}</h2>
      </div>
      <div className={bodyClasses}>{children}</div>
    </section>
  );
};

export const DetailLayout = ({
  title,
  icon: Icon,
  actions,
  children,
}) => (
  <div className="shared-form-page shared-detail-page">
    <PageFrame className="shared-form-frame">
      <div className="shared-form-shell">
        <header className="shared-form-hero">
          {Icon ? (
            <div className="shared-form-hero-icon" aria-hidden="true">
              <Icon />
            </div>
          ) : null}
          <h1>{title}</h1>
          {actions ? (
            <div className="shared-detail-hero-actions">{actions}</div>
          ) : null}
        </header>
        {children}
      </div>
    </PageFrame>
  </div>
);

export const DetailSection = ({
  title,
  icon: Icon,
  fullWidth = false,
  children,
}) => (
  <section
    className={`shared-form-section shared-detail-section${
      fullWidth ? " shared-form-section--full-width" : ""
    }`}
  >
    <div className="shared-form-section-heading">
      {Icon ? <Icon aria-hidden="true" /> : null}
      <h2>{title}</h2>
    </div>
    {children}
  </section>
);

export const DetailRow = ({ label, value, upperCase = false }) => (
  <div className="shared-detail-row">
    <span className="shared-detail-cell shared-detail-label">{label}</span>
    <span className="shared-detail-cell shared-detail-colon">:</span>
    <span
      className={`shared-detail-cell shared-detail-value${
        upperCase ? " uppercase" : ""
      }`}
    >
      {value ?? "—"}
    </span>
  </div>
);

export const FormActions = ({
  onReset,
  onSaveDraft,
  isSubmitting = false,
  resetLabel = "Reset",
  draftLabel = "Save as Draft",
  submitLabel = "Submit",
}) => (
  <div className="shared-form-actions">
    <button
      type="button"
      className="shared-form-action-button shared-form-reset-button"
      onClick={onReset}
    >
      <LuRotateCcw aria-hidden="true" />
      <span>{resetLabel}</span>
    </button>

    <div className="shared-form-primary-actions">
      {onSaveDraft ? (
        <button
          type="button"
          className="shared-form-action-button shared-form-draft-button"
          onClick={onSaveDraft}
        >
          <LuSave aria-hidden="true" />
          <span>{draftLabel}</span>
        </button>
      ) : null}

      <button
        type="submit"
        className="shared-form-action-button shared-form-submit-button"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <CircularProgress size={18} color="inherit" />
        ) : (
          <LuSend aria-hidden="true" />
        )}
        <span>{submitLabel}</span>
      </button>
    </div>
  </div>
);
