"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";

import type { EditableProject, ProjectContentBlock, ShowcaseItem, SiteContent } from "@/lib/types";

type AdminData = {
  site: SiteContent;
  showcase: ShowcaseItem[];
  projects: EditableProject[];
};

type SectionKey = "homepage" | "showcase" | "projects" | "uploads";

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
  const [activeProjectSlug, setActiveProjectSlug] = useState(initialData.projects[0]?.slug ?? "");
  const [status, setStatus] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadFolder, setUploadFolder] = useState("uploads");
  const [uploadedPath, setUploadedPath] = useState("");

  const activeProject = useMemo(
    () => projects.find((project) => project.slug === activeProjectSlug) ?? projects[0],
    [activeProjectSlug, projects],
  );

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
      current.map((project) =>
        project.slug === activeProject.slug ? mutator(project) : project,
      ),
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
        : type === "callout"
          ? { id: crypto.randomUUID(), type: "callout", title: "Callout", body: "" }
          : { id: crypto.randomUUID(), type: "section", title: "New section", body: "" };

    updateProjectBlocks([...currentBlocks, nextBlock]);
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
                  <div key={item.slug || index} className="rounded-[22px] border border-line bg-background p-4">
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
                      <Field compact label="Title" value={item.title} onChange={(value) => setShowcase((current) => current.map((entry, itemIndex) => itemIndex === index ? { ...entry, title: value } : entry))} />
                      <Field compact label="Panel label" value={item.panelLabel} onChange={(value) => setShowcase((current) => current.map((entry, itemIndex) => itemIndex === index ? { ...entry, panelLabel: value } : entry))} />
                      <ColorField label="Panel color" value={item.panelColor} onChange={(value) => setShowcase((current) => current.map((entry, itemIndex) => itemIndex === index ? { ...entry, panelColor: value } : entry))} />
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
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setShowcase((current) => [...current, { slug: "", title: "", description: "", panelLabel: "", panelColor: "#111111", panelTone: "dark" }])}
                  className="rounded-full border border-line px-4 py-2 text-sm text-foreground-muted hover:border-line-strong hover:text-foreground"
                >
                  Add showcase item
                </button>
              </div>
            </Card>
          </section>
        ) : null}

        {section === "projects" ? (
          <section className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)]">
            <Card title="Project list">
              <div className="space-y-2">
                {projects.map((project) => (
                  <button
                    key={project.slug}
                    type="button"
                    onClick={() => setActiveProjectSlug(project.slug)}
                    className={`block w-full rounded-2xl px-4 py-3 text-left text-sm transition-colors ${
                      activeProject?.slug === project.slug
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
                      slug: `new-project-${Date.now()}`,
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
                    setActiveProjectSlug(newProject.slug);
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
                  <SaveButton
                    disabled={saving}
                    onClick={() => save("project", activeProject)}
                    label={saving ? "Saving..." : "Save project"}
                  />
                }
              >
                <div className="grid gap-3 md:grid-cols-2">
                  <Field
                    compact
                    label="Slug"
                    value={activeProject.slug}
                    onChange={(value) => {
                      setProjects((current) =>
                        current.map((project) =>
                          project.slug === activeProject.slug ? { ...project, slug: value } : project,
                        ),
                      );
                      setActiveProjectSlug(value);
                    }}
                  />
                  <Field compact label="Date" value={activeProject.date} onChange={(value) => setProjects((current) => current.map((project) => project.slug === activeProject.slug ? { ...project, date: value } : project))} />
                  <Field compact label="Title" value={activeProject.title} onChange={(value) => setProjects((current) => current.map((project) => project.slug === activeProject.slug ? { ...project, title: value } : project))} />
                  <Field compact label="Live URL" value={activeProject.liveUrl ?? ""} onChange={(value) => setProjects((current) => current.map((project) => project.slug === activeProject.slug ? { ...project, liveUrl: value || undefined } : project))} />
                  <Field compact label="Thumbnail path" value={activeProject.thumbnail} onChange={(value) => setProjects((current) => current.map((project) => project.slug === activeProject.slug ? { ...project, thumbnail: value } : project))} />
                  <Field compact label="Thumbnail alt" value={activeProject.thumbnailAlt} onChange={(value) => setProjects((current) => current.map((project) => project.slug === activeProject.slug ? { ...project, thumbnailAlt: value } : project))} />
                  <Field compact label="Cover image path" value={activeProject.coverImage ?? ""} onChange={(value) => setProjects((current) => current.map((project) => project.slug === activeProject.slug ? { ...project, coverImage: value || undefined } : project))} />
                  <Field compact label="Cover image alt" value={activeProject.coverAlt ?? ""} onChange={(value) => setProjects((current) => current.map((project) => project.slug === activeProject.slug ? { ...project, coverAlt: value || undefined } : project))} />
                  <Field compact label="Role" value={activeProject.role ?? ""} onChange={(value) => setProjects((current) => current.map((project) => project.slug === activeProject.slug ? { ...project, role: value || undefined } : project))} />
                </div>
                <div className="mt-4">
                  <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-foreground-faint">
                    Excerpt
                  </label>
                  <textarea
                    rows={4}
                    value={activeProject.excerpt}
                    onChange={(event) => setProjects((current) => current.map((project) => project.slug === activeProject.slug ? { ...project, excerpt: event.target.value } : project))}
                    className="w-full rounded-2xl border border-line bg-background px-4 py-3 text-[14px] leading-7 text-foreground outline-none"
                  />
                </div>
                <div className="mt-4">
                  <div className="mb-3 flex items-center justify-between">
                    <label className="block text-xs uppercase tracking-[0.18em] text-foreground-faint">
                      Project content blocks
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <SmallButton onClick={() => addProjectBlock("section")}>Add section</SmallButton>
                      <SmallButton onClick={() => addProjectBlock("image")}>Add image</SmallButton>
                      <SmallButton onClick={() => addProjectBlock("callout")}>Add callout</SmallButton>
                    </div>
                  </div>
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
                    Use the Uploads tab first, then paste the returned image path into any image block.
                  </div>
                </div>
              </Card>
            ) : null}
          </section>
        ) : null}

        {section === "uploads" ? (
          <section className="space-y-6">
            <Card title="Image uploads">
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
                    <select
                      name="folder"
                      value={uploadFolder}
                      onChange={(event) => setUploadFolder(event.target.value)}
                      className="w-full rounded-2xl border border-line bg-background px-4 py-3 text-[14px] text-foreground outline-none"
                    >
                      <option value="uploads">uploads</option>
                      <option value="projects">projects</option>
                      <option value="showcase">showcase</option>
                      <option value="ambient">ambient</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-foreground-faint">
                      Image file
                    </span>
                    <input
                      name="file"
                      type="file"
                      accept="image/*"
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
                  {uploading ? "Uploading..." : "Upload image"}
                </button>
              </form>

              {uploadedPath ? (
                <div className="mt-5 rounded-2xl border border-line bg-background p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-foreground-faint">Use this image path</p>
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
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-line bg-background px-4 py-2.5 text-[14px] text-foreground outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
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
