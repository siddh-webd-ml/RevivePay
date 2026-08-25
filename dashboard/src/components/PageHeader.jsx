function PageHeader({
  eyebrow,
  title,
  description
}) {
  return (
    <div className="page-header">

      <p className="eyebrow">
        {eyebrow}
      </p>

      <h1>
        {title}
      </h1>

      {description && (
        <p className="page-description">
          {description}
        </p>
      )}

    </div>
  );
}

export default PageHeader;