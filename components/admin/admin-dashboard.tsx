"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";

import type { EditableProject, ProjectContentBlock, ShowcaseItem, SiteContent } from "@/lib/types";
import { getMediaTypeFromPath, resolveMediaSrc } from "@/lib/utils";

type AdminData = {
  site: SiteContent;
  showcase: ShowcaseItem[];
  projects: EditableProject[];
};

type SectionKey = "homepage" | "showcase" | "projects" | "uploads";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function shouldAutoUpdateSlug(currentSlug: string, previousTitle: string) {
  if (!currentSlug.trim()) return true;

  const previousAutoSlug = slugify(previousTitle);
  return currentSlug === previousAutoSlug;
}

const sectionLabels: Record<SectionKey, string> = {
  homepage: "Homepage",
  showcase: "Showcase",
  projects: "Projects",
  uploads: "Uploads",
};

export function AdminDashboard({ initialData }: { initialData: AdminData }) {
  const [section, setSection] = useState<SectionKey>("homepage");
  const [site, setSite] = useState(initialData.site);
  const [showcase, setShowcase] = useState(initialData.showcase);
  const [projects, setProjects] = useState(initialData.projects);
  const [activeProjectIndex, setActiveProjectIndex] = useState(0);
  const [status, setStatus] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadFolder, setUploadFolder] = useState("uploads");
  const [uploadedPath, setUploadedPath] = useState("");
  const [inlineUploadingKey, setInlineUploadingKey] = useState<string | null>(null);

  const safeActiveProjectIndex = Math.min(activeProjectIndex, Math.max(projects.length - 1, 0));
  const activeProject = useMemo(() => projects[safeActiveProjectIndex], [projects, safeActiveProjectIndex]);

  async function save(kind: "site" | "showcase" | "project", payload: unknown) {
    setSaving(true);
    setStatus("");

    const response = await fetch("/api/admin/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, payload }),
    });

    const data = (await response.json()) as { message?: string; error?: string };
    setSaving(false);
    setStatus(data.message ?? data.error ?? "Saved.");
  }

  async function removeActiveProject() {
    if (!activeProject) return;

    const projectToRemove = activeProject;
    setSaving(true);
    setStatus("");

    const response = await fetch("/api/admin/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: "project-delete",
        payload: { slug: projectToRemove.slug, title: projectToRemove.title },
      }),
    });

    const data = (await response.json()) as { message?: string; error?: string };

    if (!response.ok) {
      setSaving(false);
      setStatus(data.error ?? "Could not remove project.");
      return;
    }

    const removedIndex = safeActiveProjectIndex;
    const nextProjects = projects.filter((_, index) => index !== removedIndex);
    setProjects(nextProjects);
    setActiveProjectIndex(Math.max(0, Math.min(removedIndex, nextProjects.length - 1)));
    setSaving(false);
    setStatus(data.message ?? "Project removed.");
  }

  async function uploadImage(formData: FormData) {
    setUploading(true);
    setStatus("");
    setUploadedPath("");

    const response = await fetch("/api/admin/upload-image", {
      method: "POST",
      body: formData,
    });

    const data = (await response.json()) as { path?: string; error?: string; message?: string };
    setUploading(false);
    setStatus(data.message ?? data.error ?? "");
    if (data.path) setUploadedPath(data.path);
  }

  async function uploadInlineMedia(file: File, folder: string) {
    const formData = new FormData();
    formData.set("file", file);
    formData.set("folder", folder);

    const response = await fetch("/api/admin/upload-image", {
      method: "POST",
      body: formData,
    });

    const data = (await response.json()) as { path?: string; error?: string; message?: string };

    if (!response.ok || !data.path) {
      throw new Error(data.error ?? "Upload failed.");
    }

    setStatus(data.message ?? "Media uploaded. Save your edits to publish it.");
    setUploadedPath(data.path);
    return data.path;
  }

  function updateLinkList(
    key: "socialLinks" | "topBarLinks" | "accentLinks",
    index: number,
    field: string,
    value: string,
  ) {
    setSite((current) => ({
      ...current,
      [key]: current[key].map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    }));
  }

  function getShowcaseMedia(item: ShowcaseItem) {
    return item.media ?? (item.image ? { type: "image" as const, ...item.image } : undefined);
  }

  function updateActiveProject(mutator: (project: EditableProject) => EditableProject) {
    if (!activeProject) return;
    setProjects((current) =>
      current.map((project, index) => (index === safeActiveProjectIndex ? mutator(project) : project)),
    );
  }

  function updateProjectBlocks(blocks: ProjectContentBlock[]) {
    updateActiveProject((project) => ({ ...project, blocks }));
  }

  function addProjectBlock(type: ProjectContentBlock["type"]) {
    const currentBlocks = activeProject?.blocks ?? [];
    const nextBlock: ProjectContentBlock =
      type === "image"
        ? { id: crypto.randomUUID(), type: "image", src: "", alt: "", caption: "" }
        : type === "video"
          ? { id: crypto.randomUUID(), type: "video", src: "", alt: "", caption: "", poster: "" }
        : type === "callout"
          ? { id: crypto.randomUUID(), type: "callout", title: "Callout", body: "" }
          : { id: crypto.randomUUID(), type: "section", title: "New section", body: "" };

    updateProjectBlocks([...currentBlocks, nextBlock]);
  }

  function renderProjectBlockToolbar(position: "top" | "bottom") {
    return (
      <div className={`flex items-center justify-between ${position === "bottom" ? "mb-4 mt-6" : "mb-3"}`}>
        <label className="block text-xs uppercase tracking-[0.18em] text-foreground-faint">
          Project content blocks
        </label>
        <div className="flex flex-wrap gap-2">
          <SmallButton onClick={() => addProjectBlock("section")}>Add section</SmallButton>
          <SmallButton onClick={() => addProjectBlock("image")}>Add image</SmallButton>
          <SmallButton onClick={() => addProjectBlock("video")}>Add video</SmallButton>
          <SmallButton onClick={() => addProjectBlock("callout")}>Add callout</SmallButton>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-[1200px] gap-8 px-5 py-8 lg:grid-cols-[220px_minmax(0,1fr)]">
      <aside className="rounded-[24px] border border-line bg-background-soft p-3 lg:sticky lg:top-6 lg:h-fit">
        <nav className="space-y-1">
          {(Object.keys(sectionLabels) as SectionKey[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setSection(key)}
              className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm transition-colors ${
                section === key
                  ? "bg-foreground text-background"
                  : "text-foreground-muted hover:bg-background hover:text-foreground"
              }`}
            >
              <span>{sectionLabels[key]}</span>
            </button>
          ))}
        </nav>
      </aside>

      <div className="space-y-6">
        <div className="rounded-[24px] border border-line bg-background-soft px-5 py-4 text-sm text-foreground-muted">
          {status || "Changes save back to your repo, then Vercel redeploys automatically."}
        </div>

        {section === "homepage" ? (
          <section className="space-y-6">
            <Card
              title="Site metadata"
              action={
                <SaveButton disabled={saving} onClick={() => save("site", site)} label={saving ? "Saving..." : "Save homepage"} />
              }
            >
              <Field label="Site title" value={site.siteMeta.title} onChange={(value) => setSite((current) => ({ ...current, siteMeta: { ...current.siteMeta, title: value } }))} />
              <Field label="Description" value={site.siteMeta.description} onChange={(value) => setSite((current) => ({ ...current, siteMeta: { ...current.siteMeta, description: value } }))} />
              <Field label="Canonical URL" value={site.siteMeta.url} onChange={(value) => setSite((current) => ({ ...current, siteMeta: { ...current.siteMeta, url: value } }))} />
              <Field label="Hero title" value={site.hero.title} onChange={(value) => setSite((current) => ({ ...current, hero: { ...current.hero, title: value } }))} />
              <Field label="Hero subtitle" value={site.hero.subtitle} onChange={(value) => setSite((current) => ({ ...current, hero: { ...current.hero, subtitle: value } }))} />
              <Field label="Contact intro" value={site.contact.intro} onChange={(value) => setSite((current) => ({ ...current, contact: { ...current.contact, intro: value } }))} />
            </Card>

            <Card title="Hero paragraphs">
              <div className="space-y-4">
                {site.heroSummary.map((paragraph, index) => (
                  <div key={`paragraph-${index}`} className="rounded-2xl border border-line bg-background p-3">
                    <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-foreground-faint">
                      Paragraph {index + 1}
                    </label>
                    <textarea
                      value={paragraph}
                      onChange={(event) =>
                        setSite((current) => ({
                          ...current,
                          heroSummary: current.heroSummary.map((item, itemIndex) =>
                            itemIndex === index ? event.target.value : item,
                          ),
                        }))
                      }
                      rows={5}
                      className="min-h-[120px] w-full resize-y border-none bg-transparent text-[14px] leading-7 text-foreground outline-none"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setSite((current) => ({ ...current, heroSummary: [...current.heroSummary, ""] }))}
                  className="rounded-full border border-line px-4 py-2 text-sm text-foreground-muted hover:border-line-strong hover:text-foreground"
                >
                  Add paragraph
                </button>
              </div>
            </Card>

            <Card title="Navigation and contact links">
              <LinkEditor
                title="Top bar links"
                items={site.topBarLinks}
                onChange={(index, field, value) => updateLinkList("topBarLinks", index, field, value)}
                onAdd={() => setSite((current) => ({ ...current, topBarLinks: [...current.topBarLinks, { label: "", href: "" }] }))}
              />
              <div className="mt-6">
                <LinkEditor
                  title="Contact links"
                  items={site.socialLinks}
                  onChange={(index, field, value) => updateLinkList("socialLinks", index, field, value)}
                  onAdd={() => setSite((current) => ({ ...current, socialLinks: [...current.socialLinks, { label: "", href: "" }] }))}
                />
              </div>
            </Card>

            <Card title="Accent link colors">
              <div className="space-y-4">
                {site.accentLinks.map((link, index) => (
                  <div key={`${link.label}-${index}`} className="grid gap-3 rounded-2xl border border-line bg-background p-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_120px_120px]">
                    <Field compact label="Label" value={link.label} onChange={(value) => updateLinkList("accentLinks", index, "label", value)} />
                    <Field compact label="URL" value={link.href} onChange={(value) => updateLinkList("accentLinks", index, "href", value)} />
                    <ColorField label="Light color" value={link.color} onChange={(value) => updateLinkList("accentLinks", index, "color", value)} />
                    <ColorField label="Dark color" value={link.darkColor} onChange={(value) => updateLinkList("accentLinks", index, "darkColor", value)} />
                  </div>
                ))}
              </div>
            </Card>
          </section>
        ) : null}

        {section === "showcase" ? (
          <section className="space-y-6">
            <Card
              title="Design showcase items"
              action={
                <SaveButton disabled={saving} onClick={() => save("showcase", showcase)} label={saving ? "Saving..." : "Save showcase"} />
              }
            >
              <div className="space-y-4">
                {showcase.map((item, index) => (
                  <div key={`showcase-item-${index}`} className="rounded-[22px] border border-line bg-background p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">{item.title || "Untitled showcase item"}</p>
                      <button
                        type="button"
                        onClick={() => setShowcase((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                        className="text-sm text-foreground-faint hover:text-foreground"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <Field compact label="Slug" value={item.slug} onChange={(value) => setShowcase((current) => current.map((entry, itemIndex) => itemIndex === index ? { ...entry, slug: value } : entry))} />
                      <Field
                        compact
                        label="Title"
                        value={item.title}
                        onChange={(value) =>
                          setShowcase((current) =>
                            current.map((entry, itemIndex) => {
                              if (itemIndex !== index) return entry;
                              const nextSlug = shouldAutoUpdateSlug(entry.slug, entry.title)
                                ? slugify(value)
                                : entry.slug;
                              return { ...entry, title: value, slug: nextSlug };
                            }),
                          )
                        }
                      />
                      <Field compact label="Panel label" value={item.panelLabel} onChange={(value) => setShowcase((current) => current.map((entry, itemIndex) => itemIndex === index ? { ...entry, panelLabel: value } : entry))} />
                      <ColorField label="Panel color" value={item.panelColor} onChange={(value) => setShowcase((current) => current.map((entry, itemIndex) => itemIndex === index ? { ...entry, panelColor: value } : entry))} />
                      <SelectField
                        label="Category"
                        value={item.category ?? "mobile-apps"}
                        options={[
                          { label: "Mobile Apps", value: "mobile-apps" },
                          { label: "Websites", value: "websites" },
                          { label: "Dashboards", value: "dashboards" },
                        ]}
                        onChange={(value: string) =>
                          setShowcase((current) =>
                            current.map((entry, itemIndex) =>
                              itemIndex === index
                                ? {
                                    ...entry,
                                    category: value as "mobile-apps" | "websites" | "dashboards",
                                  }
                                : entry,
                            ),
                          )
                        }
                      />
                      <Field compact label="Optional link" value={item.href ?? ""} onChange={(value) => setShowcase((current) => current.map((entry, itemIndex) => itemIndex === index ? { ...entry, href: value || undefined } : entry))} />
                      <SelectField
                        label="Media type"
                        value={getShowcaseMedia(item)?.type ?? "image"}
                        options={[
                          { label: "Image / GIF", value: "image" },
                          { label: "Video", value: "video" },
                        ]}
                        onChange={(value: string) =>
                          setShowcase((current) =>
                            current.map((entry, itemIndex) =>
                              itemIndex === index
                                ? {
                                    ...entry,
                                    image: undefined,
                                    media: {
                                      type: value as "image" | "video",
                                      src: getShowcaseMedia(entry)?.src ?? "",
                                      alt: getShowcaseMedia(entry)?.alt ?? entry.title,
                                      poster: value === "video" ? getShowcaseMedia(entry)?.poster : undefined,
                                    },
                                  }
                                : entry,
                            ),
                          )
                        }
                      />
                      <Field
                        compact
                        label="Media path"
                        value={getShowcaseMedia(item)?.src ?? ""}
                        onChange={(value) =>
                          setShowcase((current) =>
                            current.map((entry, itemIndex) =>
                              itemIndex === index
                                ? {
                                    ...entry,
                                    image: undefined,
                                    media: getShowcaseMedia(entry)
                                      ? { ...getShowcaseMedia(entry)!, src: value }
                                      : { type: "image", src: value, alt: entry.title },
                                  }
                                : entry,
                            ),
                          )
                        }
                      />
                      <MediaUploadField
                        label={(getShowcaseMedia(item)?.type ?? "image") === "video" ? "Upload video" : "Upload image / gif"}
                        buttonLabel="Choose file"
                        accept={(getShowcaseMedia(item)?.type ?? "image") === "video" ? "video/*" : "image/*"}
                        uploading={inlineUploadingKey === `showcase-${index}-media`}
                        onUploadStart={() => setInlineUploadingKey(`showcase-${index}-media`)}
                        onUploadEnd={() => setInlineUploadingKey(null)}
                        onUpload={async (file) => {
                          const path = await uploadInlineMedia(file, "showcase");
                          setShowcase((current) =>
                            current.map((entry, itemIndex) =>
                              itemIndex === index
                                ? {
                                    ...entry,
                                    image: undefined,
                                    media: getShowcaseMedia(entry)
                                      ? { ...getShowcaseMedia(entry)!, src: path }
                                      : { type: "image", src: path, alt: entry.title },
                                  }
                                : entry,
                            ),
                          );
                        }}
                      />
                      <Field
                        compact
                        label="Media alt"
                        value={getShowcaseMedia(item)?.alt ?? ""}
                        onChange={(value) =>
                          setShowcase((current) =>
                            current.map((entry, itemIndex) =>
                              itemIndex === index
                                ? {
                                    ...entry,
                                    image: undefined,
                                    media: getShowcaseMedia(entry)
                                      ? { ...getShowcaseMedia(entry)!, alt: value }
                                      : { type: "image", src: "", alt: value },
                                  }
                                : entry,
                            ),
                          )
                        }
                      />
                      {(getShowcaseMedia(item)?.type ?? "image") === "video" ? (
                        <>
                          <Field
                            compact
                            label="Poster image"
                            value={getShowcaseMedia(item)?.poster ?? ""}
                            onChange={(value) =>
                              setShowcase((current) =>
                                current.map((entry, itemIndex) =>
                                  itemIndex === index
                                    ? {
                                        ...entry,
                                        image: undefined,
                                        media: getShowcaseMedia(entry)
                                          ? { ...getShowcaseMedia(entry)!, poster: value || undefined }
                                          : { type: "video", src: "", alt: entry.title, poster: value || undefined },
                                      }
                                    : entry,
                                ),
                              )
                            }
                          />
                          <MediaUploadField
                            label="Upload poster"
                            buttonLabel="Choose poster"
                            accept="image/*"
                            uploading={inlineUploadingKey === `showcase-${index}-poster`}
                            onUploadStart={() => setInlineUploadingKey(`showcase-${index}-poster`)}
                            onUploadEnd={() => setInlineUploadingKey(null)}
                            onUpload={async (file) => {
                              const path = await uploadInlineMedia(file, "showcase");
                              setShowcase((current) =>
                                current.map((entry, itemIndex) =>
                                  itemIndex === index
                                    ? {
                                        ...entry,
                                        image: undefined,
                                        media: getShowcaseMedia(entry)
                                          ? { ...getShowcaseMedia(entry)!, poster: path }
                                          : { type: "video", src: "", alt: entry.title, poster: path },
                                      }
                                    : entry,
                                ),
                              );
                            }}
                          />
                        </>
                      ) : null}
                    </div>
                    <div className="mt-3">
                      <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-foreground-faint">
                        Description
                      </label>
                      <textarea
                        rows={4}
                        value={item.description}
                        onChange={(event) => setShowcase((current) => current.map((entry, itemIndex) => itemIndex === index ? { ...entry, description: event.target.value } : entry))}
                        className="w-full rounded-2xl border border-line bg-background px-4 py-3 text-[14px] leading-7 text-foreground outline-none"
                      />
                    </div>
                    {getShowcaseMedia(item)?.src ? (
                      <div className="mt-4">
                        <MediaPreview
                          type={getShowcaseMedia(item)?.type ?? "image"}
                          src={getShowcaseMedia(item)!.src}
                          alt={getShowcaseMedia(item)!.alt}
                          poster={getShowcaseMedia(item)?.poster}
                        />
                      </div>
                    ) : null}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setShowcase((current) => [...current, { slug: "", title: "", description: "", panelLabel: "", panelColor: "#111111", panelTone: "dark" }])}
                  className="rounded-full border border-line px-4 py-2 text-sm text-foreground-muted hover:border-line-strong hover:text-foreground"
                >
                  Add showcase item
                </button>
                <div className="flex justify-end pt-2">
                  <SaveButton
                    disabled={saving}
                    onClick={() => save("showcase", showcase)}
                    label={saving ? "Saving..." : "Save showcase"}
                  />
                </div>
              </div>
            </Card>
          </section>
        ) : null}

        {section === "projects" ? (
          <section className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)]">
            <Card title="Project list">
              <div className="space-y-2">
                {projects.map((project, index) => (
                  <button
                    key={`project-item-${index}`}
                    type="button"
                    onClick={() => setActiveProjectIndex(index)}
                    className={`block w-full rounded-2xl px-4 py-3 text-left text-sm transition-colors ${
                      safeActiveProjectIndex === index
                        ? "bg-foreground text-background"
                        : "bg-background text-foreground-muted hover:text-foreground"
                    }`}
                  >
                    <span className="block font-medium">{project.title}</span>
                    <span className="mt-1 block text-xs opacity-70">{project.slug}</span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const newProject: EditableProject = {
                      slug: slugify("New Project"),
                      title: "New Project",
                      date: new Date().toISOString().slice(0, 10),
                      excerpt: "",
                      thumbnail: "",
                      thumbnailAlt: "",
                      body: "",
                      blocks: [
                        {
                          id: crypto.randomUUID(),
                          type: "section",
                          title: "Overview",
                          body: "Write your project story here.",
                        },
                      ],
                    };
                    setProjects((current) => [newProject, ...current]);
                    setActiveProjectIndex(0);
                  }}
                  className="rounded-full border border-line px-4 py-2 text-sm text-foreground-muted hover:border-line-strong hover:text-foreground"
                >
                  Add project
                </button>
              </div>
            </Card>

            {activeProject ? (
              <Card
                title="Project editor"
                action={
                  <div className="flex items-center gap-2">
                    <SmallButton onClick={removeActiveProject}>Remove project</SmallButton>
                    <SaveButton
                      disabled={saving}
                      onClick={() => save("project", activeProject)}
                      label={saving ? "Saving..." : "Save project"}
                    />
                  </div>
                }
              >
                <div className="grid gap-3 md:grid-cols-2">
                  <Field
                    compact
                    label="Slug"
                    value={activeProject.slug}
                    onChange={(value) => updateActiveProject((project) => ({ ...project, slug: value }))}
                  />
                  <Field compact label="Date" value={activeProject.date} onChange={(value) => updateActiveProject((project) => ({ ...project, date: value }))} />
                  <Field
                    compact
                    label="Title"
                    value={activeProject.title}
                    onChange={(value) =>
                      updateActiveProject((project) => ({
                        ...project,
                        title: value,
                        slug: shouldAutoUpdateSlug(project.slug, project.title) ? slugify(value) : project.slug,
                      }))
                    }
                  />
                  <Field compact label="Live URL" value={activeProject.liveUrl ?? ""} onChange={(value) => updateActiveProject((project) => ({ ...project, liveUrl: value || undefined }))} />
                  <Field compact label="Thumbnail path" value={activeProject.thumbnail} onChange={(value) => updateActiveProject((project) => ({ ...project, thumbnail: value }))} />
                  <Field compact label="Thumbnail alt" value={activeProject.thumbnailAlt} onChange={(value) => updateActiveProject((project) => ({ ...project, thumbnailAlt: value }))} />
                  <Field compact label="Cover image path" value={activeProject.coverImage ?? ""} onChange={(value) => updateActiveProject((project) => ({ ...project, coverImage: value || undefined }))} />
                  <Field compact label="Cover image alt" value={activeProject.coverAlt ?? ""} onChange={(value) => updateActiveProject((project) => ({ ...project, coverAlt: value || undefined }))} />
                  <Field compact label="Role" value={activeProject.role ?? ""} onChange={(value) => updateActiveProject((project) => ({ ...project, role: value || undefined }))} />
                  <MediaUploadField
                    label="Upload thumbnail"
                    buttonLabel="Choose thumbnail"
                    accept="image/*,video/*"
                    uploading={inlineUploadingKey === "project-thumbnail"}
                    onUploadStart={() => setInlineUploadingKey("project-thumbnail")}
                    onUploadEnd={() => setInlineUploadingKey(null)}
                    onUpload={async (file) => {
                      const path = await uploadInlineMedia(file, "projects");
                      updateActiveProject((project) => ({ ...project, thumbnail: path }));
                    }}
                  />
                  <MediaUploadField
                    label="Upload cover"
                    buttonLabel="Choose cover"
                    accept="image/*,video/*"
                    uploading={inlineUploadingKey === "project-cover"}
                    onUploadStart={() => setInlineUploadingKey("project-cover")}
                    onUploadEnd={() => setInlineUploadingKey(null)}
                    onUpload={async (file) => {
                      const path = await uploadInlineMedia(file, "projects");
                      updateActiveProject((project) => ({ ...project, coverImage: path }));
                    }}
                  />
                </div>
                {activeProject.thumbnail || activeProject.coverImage ? (
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    {activeProject.thumbnail ? (
                      <div>
                        <p className="mb-2 text-xs uppercase tracking-[0.18em] text-foreground-faint">Thumbnail preview</p>
                        <MediaPreview
                          type={getMediaTypeFromPath(activeProject.thumbnail)}
                          src={activeProject.thumbnail}
                          alt={activeProject.thumbnailAlt}
                        />
                      </div>
                    ) : null}
                    {activeProject.coverImage ? (
                      <div>
                        <p className="mb-2 text-xs uppercase tracking-[0.18em] text-foreground-faint">Cover preview</p>
                        <MediaPreview
                          type={getMediaTypeFromPath(activeProject.coverImage)}
                          src={activeProject.coverImage}
                          alt={activeProject.coverAlt ?? activeProject.title}
                        />
                      </div>
                    ) : null}
                  </div>
                ) : null}
                <div className="mt-4">
                  <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-foreground-faint">
                    Excerpt
                  </label>
                  <textarea
                    rows={4}
                    value={activeProject.excerpt}
                    onChange={(event) => updateActiveProject((project) => ({ ...project, excerpt: event.target.value }))}
                    className="w-full rounded-2xl border border-line bg-background px-4 py-3 text-[14px] leading-7 text-foreground outline-none"
                  />
                </div>
                <div className="mt-4">
                  {renderProjectBlockToolbar("top")}
                  <div className="space-y-4">
                    {(activeProject.blocks ?? []).map((block, index) => (
                      <div key={block.id} className="rounded-[22px] border border-line bg-background p-4">
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium capitalize text-foreground">{block.type}</p>
                            <p className="text-xs text-foreground-faint">Block {index + 1}</p>
                          </div>
                          <div className="flex gap-2">
                            <SmallButton
                              onClick={() => {
                                const blocks = [...(activeProject.blocks ?? [])];
                                if (index > 0) {
                                  [blocks[index - 1], blocks[index]] = [blocks[index], blocks[index - 1]];
                                  updateProjectBlocks(blocks);
                                }
                              }}
                            >
                              Up
                            </SmallButton>
                            <SmallButton
                              onClick={() => {
                                const blocks = [...(activeProject.blocks ?? [])];
                                if (index < blocks.length - 1) {
                                  [blocks[index + 1], blocks[index]] = [blocks[index], blocks[index + 1]];
                                  updateProjectBlocks(blocks);
                                }
                              }}
                            >
                              Down
                            </SmallButton>
                            <SmallButton
                              onClick={() =>
                                updateProjectBlocks(
                                  (activeProject.blocks ?? []).filter((item) => item.id !== block.id),
                                )
                              }
                            >
                              Remove
                            </SmallButton>
                          </div>
                        </div>

                        {block.type === "section" ? (
                          <div className="space-y-3">
                            <Field
                              compact
                              label="Section title"
                              value={block.title}
                              onChange={(value) =>
                                updateProjectBlocks(
                                  (activeProject.blocks ?? []).map((item) =>
                                    item.id === block.id ? { ...item, title: value } : item,
                                  ),
                                )
                              }
                            />
                            <TextAreaField
                              label="Section description"
                              value={block.body}
                              rows={8}
                              onChange={(value) =>
                                updateProjectBlocks(
                                  (activeProject.blocks ?? []).map((item) =>
                                    item.id === block.id ? { ...item, body: value } : item,
                                  ),
                                )
                              }
                            />
                          </div>
                        ) : null}

                        {block.type === "image" ? (
                          <div className="grid gap-3 md:grid-cols-2">
                            <Field
                              compact
                              label="Image path"
                              value={block.src}
                              onChange={(value) =>
                                updateProjectBlocks(
                                  (activeProject.blocks ?? []).map((item) =>
                                    item.id === block.id ? { ...item, src: value } : item,
                                  ),
                                )
                              }
                            />
                            <Field
                              compact
                              label="Image alt"
                              value={block.alt}
                              onChange={(value) =>
                                updateProjectBlocks(
                                  (activeProject.blocks ?? []).map((item) =>
                                    item.id === block.id ? { ...item, alt: value } : item,
                                  ),
                                )
                              }
                            />
                            <MediaUploadField
                              label="Upload image / gif"
                              buttonLabel="Choose media"
                              accept="image/*"
                              uploading={inlineUploadingKey === block.id}
                              onUploadStart={() => setInlineUploadingKey(block.id)}
                              onUploadEnd={() => setInlineUploadingKey(null)}
                              onUpload={async (file) => {
                                const path = await uploadInlineMedia(file, "projects");
                                updateProjectBlocks(
                                  (activeProject.blocks ?? []).map((item) =>
                                    item.id === block.id ? { ...item, src: path } : item,
                                  ),
                                );
                              }}
                            />
                            <div className="md:col-span-2">
                              <TextAreaField
                                label="Caption"
                                value={block.caption ?? ""}
                                rows={3}
                                onChange={(value) =>
                                  updateProjectBlocks(
                                    (activeProject.blocks ?? []).map((item) =>
                                      item.id === block.id ? { ...item, caption: value } : item,
                                    ),
                                  )
                                }
                              />
                            </div>
                            {block.src ? (
                              <div className="md:col-span-2">
                                <MediaPreview type="image" src={block.src} alt={block.alt} />
                              </div>
                            ) : null}
                          </div>
                        ) : null}

                        {block.type === "video" ? (
                          <div className="grid gap-3 md:grid-cols-2">
                            <Field
                              compact
                              label="Video path"
                              value={block.src}
                              onChange={(value) =>
                                updateProjectBlocks(
                                  (activeProject.blocks ?? []).map((item) =>
                                    item.id === block.id ? { ...item, src: value } : item,
                                  ),
                                )
                              }
                            />
                            <Field
                              compact
                              label="Video title"
                              value={block.alt}
                              onChange={(value) =>
                                updateProjectBlocks(
                                  (activeProject.blocks ?? []).map((item) =>
                                    item.id === block.id ? { ...item, alt: value } : item,
                                  ),
                                )
                              }
                            />
                            <MediaUploadField
                              label="Upload video"
                              buttonLabel="Choose video"
                              accept="video/*"
                              uploading={inlineUploadingKey === `${block.id}-video`}
                              onUploadStart={() => setInlineUploadingKey(`${block.id}-video`)}
                              onUploadEnd={() => setInlineUploadingKey(null)}
                              onUpload={async (file) => {
                                const path = await uploadInlineMedia(file, "projects");
                                updateProjectBlocks(
                                  (activeProject.blocks ?? []).map((item) =>
                                    item.id === block.id ? { ...item, src: path } : item,
                                  ),
                                );
                              }}
                            />
                            <Field
                              compact
                              label="Poster image"
                              value={block.poster ?? ""}
                              onChange={(value) =>
                                updateProjectBlocks(
                                  (activeProject.blocks ?? []).map((item) =>
                                    item.id === block.id ? { ...item, poster: value || undefined } : item,
                                  ),
                                )
                              }
                            />
                            <MediaUploadField
                              label="Upload poster"
                              buttonLabel="Choose poster"
                              accept="image/*"
                              uploading={inlineUploadingKey === `${block.id}-poster`}
                              onUploadStart={() => setInlineUploadingKey(`${block.id}-poster`)}
                              onUploadEnd={() => setInlineUploadingKey(null)}
                              onUpload={async (file) => {
                                const path = await uploadInlineMedia(file, "projects");
                                updateProjectBlocks(
                                  (activeProject.blocks ?? []).map((item) =>
                                    item.id === block.id ? { ...item, poster: path } : item,
                                  ),
                                );
                              }}
                            />
                            <div className="md:col-span-2">
                              <TextAreaField
                                label="Caption"
                                value={block.caption ?? ""}
                                rows={3}
                                onChange={(value) =>
                                  updateProjectBlocks(
                                    (activeProject.blocks ?? []).map((item) =>
                                      item.id === block.id ? { ...item, caption: value } : item,
                                    ),
                                  )
                                }
                              />
                            </div>
                            {block.src ? (
                              <div className="md:col-span-2">
                                <MediaPreview
                                  type="video"
                                  src={block.src}
                                  alt={block.alt}
                                  poster={block.poster}
                                />
                              </div>
                            ) : null}
                          </div>
                        ) : null}

                        {block.type === "callout" ? (
                          <div className="space-y-3">
                            <Field
                              compact
                              label="Callout title"
                              value={block.title}
                              onChange={(value) =>
                                updateProjectBlocks(
                                  (activeProject.blocks ?? []).map((item) =>
                                    item.id === block.id ? { ...item, title: value } : item,
                                  ),
                                )
                              }
                            />
                            <TextAreaField
                              label="Callout description"
                              value={block.body}
                              rows={6}
                              onChange={(value) =>
                                updateProjectBlocks(
                                  (activeProject.blocks ?? []).map((item) =>
                                    item.id === block.id ? { ...item, body: value } : item,
                                  ),
                                )
                              }
                            />
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 rounded-2xl border border-dashed border-line bg-background px-4 py-3 text-sm leading-6 text-foreground-muted">
                    Upload directly inside each media block. Save the project after uploading so the live site picks up the new asset on the next deploy.
                  </div>
                  {renderProjectBlockToolbar("bottom")}
                  <div className="mt-6 flex justify-end gap-2">
                    <SmallButton onClick={removeActiveProject}>Remove project</SmallButton>
                    <SaveButton
                      disabled={saving}
                      onClick={() => save("project", activeProject)}
                      label={saving ? "Saving..." : "Save project"}
                    />
                  </div>
                </div>
              </Card>
            ) : null}
          </section>
        ) : null}

        {section === "uploads" ? (
          <section className="space-y-6">
            <Card title="Media uploads">
              <form
                className="space-y-4"
                onSubmit={async (event) => {
                  event.preventDefault();
                  const formData = new FormData(event.currentTarget);
                  await uploadImage(formData);
                }}
              >
                <div className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
                  <label className="block">
                    <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-foreground-faint">
                      Target folder
                    </span>
                    <div className="relative">
                      <select
                        name="folder"
                        value={uploadFolder}
                        onChange={(event) => setUploadFolder(event.target.value)}
                        className="w-full appearance-none rounded-2xl border border-line bg-background px-4 py-3 pr-10 text-[14px] text-foreground outline-none"
                      >
                        <option value="uploads">uploads</option>
                        <option value="projects">projects</option>
                        <option value="showcase">showcase</option>
                        <option value="ambient">ambient</option>
                      </select>
                      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-foreground-muted">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                          <path
                            d="M4.5 6.75L9 11.25L13.5 6.75"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </div>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-foreground-faint">
                      Media file
                    </span>
                    <input
                      name="file"
                      type="file"
                      accept="image/*,video/*"
                      className="w-full rounded-2xl border border-line bg-background px-4 py-[11px] text-[14px] text-foreground outline-none"
                      required
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={uploading}
                  className="rounded-full bg-foreground px-5 py-2.5 text-sm text-background transition-opacity hover:opacity-88 disabled:opacity-60"
                >
                  {uploading ? "Uploading..." : "Upload media"}
                </button>
              </form>

              {uploadedPath ? (
                <div className="mt-5 rounded-2xl border border-line bg-background p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-foreground-faint">Use this media path</p>
                  <p className="mt-2 text-sm text-foreground">{uploadedPath}</p>
                </div>
              ) : null}
            </Card>
          </section>
        ) : null}
      </div>
    </div>
  );
}

function Card({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-line bg-background-soft p-5 shadow-soft sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-[1.2rem] font-semibold tracking-[-0.03em] text-foreground">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function SaveButton({
  label,
  disabled,
  onClick,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="rounded-full bg-foreground px-5 py-2.5 text-sm text-background transition-opacity hover:opacity-88 disabled:opacity-60"
    >
      {label}
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  compact = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  compact?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-foreground-faint">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full rounded-2xl border border-line bg-background px-4 text-[14px] text-foreground outline-none ${
          compact ? "py-2.5" : "py-3"
        }`}
      />
    </label>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-foreground-faint">{label}</span>
      <div className="flex items-center gap-3 rounded-2xl border border-line bg-background px-3 py-2.5">
        <input type="color" value={value} onChange={(event) => onChange(event.target.value)} className="h-8 w-8 rounded-full border-none bg-transparent p-0" />
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full border-none bg-transparent text-[14px] text-foreground outline-none"
        />
      </div>
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-foreground-faint">{label}</span>
      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full appearance-none rounded-2xl border border-line bg-background px-4 py-2.5 pr-10 text-[14px] text-foreground outline-none"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-foreground-muted">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path
              d="M4.5 6.75L9 11.25L13.5 6.75"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  rows = 5,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-foreground-faint">{label}</span>
      <textarea
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-line bg-background px-4 py-3 text-[14px] leading-7 text-foreground outline-none"
      />
    </label>
  );
}

function SmallButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-line px-3 py-1.5 text-xs text-foreground-muted hover:border-line-strong hover:text-foreground"
    >
      {children}
    </button>
  );
}

function MediaUploadField({
  label,
  buttonLabel,
  accept,
  uploading,
  onUpload,
  onUploadStart,
  onUploadEnd,
}: {
  label: string;
  buttonLabel: string;
  accept: string;
  uploading: boolean;
  onUpload: (file: File) => Promise<void>;
  onUploadStart: () => void;
  onUploadEnd: () => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-foreground-faint">{label}</span>
      <input
        type="file"
        accept={accept}
        className="hidden"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          onUploadStart();
          try {
            await onUpload(file);
          } finally {
            onUploadEnd();
            event.currentTarget.value = "";
          }
        }}
      />
      <span className="inline-flex w-full cursor-pointer items-center justify-center rounded-2xl border border-line bg-background px-4 py-2.5 text-[14px] text-foreground-muted transition-colors hover:border-line-strong hover:text-foreground">
        {uploading ? "Uploading..." : buttonLabel}
      </span>
    </label>
  );
}

function MediaPreview({
  type,
  src,
  alt,
  poster,
}: {
  type: "image" | "video";
  src: string;
  alt: string;
  poster?: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-background-soft">
      {type === "video" ? (
        <video
          src={resolveMediaSrc(src)}
          poster={resolveMediaSrc(poster)}
          title={alt}
          className="block aspect-[16/10] w-full object-cover"
          controls
          playsInline
          preload="metadata"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={resolveMediaSrc(src)} alt={alt} className="block aspect-[16/10] w-full object-cover" />
      )}
    </div>
  );
}

function LinkEditor({
  title,
  items,
  onChange,
  onAdd,
}: {
  title: string;
  items: { label: string; href: string }[];
  onChange: (index: number, field: string, value: string) => void;
  onAdd: () => void;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <button
          type="button"
          onClick={onAdd}
          className="rounded-full border border-line px-3 py-1.5 text-xs text-foreground-muted hover:border-line-strong hover:text-foreground"
        >
          Add link
        </button>
      </div>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={`${item.label}-${index}`} className="grid gap-3 rounded-2xl border border-line bg-background p-4 md:grid-cols-2">
            <Field compact label="Label" value={item.label} onChange={(value) => onChange(index, "label", value)} />
            <Field compact label="URL" value={item.href} onChange={(value) => onChange(index, "href", value)} />
          </div>
        ))}
      </div>
    </div>
  );
}
