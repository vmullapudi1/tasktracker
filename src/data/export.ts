import type { AppData } from './types';

export function downloadJSON(data: AppData, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportToMarkdown(data: AppData) {
  let content = `# ${data.settings.dashboardName} Export - ${new Date().toLocaleDateString()}\n\n`;

  content += `## Projects\n\n`;
  data.projects.forEach(p => {
    content += `### ${p.code}: ${p.name}\n`;
    content += `- Target Hours: ${p.targetHours}h\n`;
    content += `- Hours Logged: ${p.hoursLogged}h\n`;
    content += `- Status: ${p.active ? 'Active' : 'Inactive'}\n\n`;
    
    if (p.phases.length > 0) {
      content += `#### Phases\n`;
      p.phases.forEach(ph => {
        content += `- [${ph.done ? 'x' : ' '}] ${ph.name}\n`;
        ph.checkpoints?.forEach(cp => {
          content += `  - [${cp.done ? 'x' : ' '}] ${cp.name}\n`;
        });
      });
      content += `\n`;
    }

    if (p.updates && p.updates.length > 0) {
      content += `#### Updates\n`;
      p.updates.forEach(u => {
        content += `**${u.date}**: ${u.text}\n\n`;
      });
    }
  });

  content += `## Reading List\n\n`;
  data.papers.forEach(paper => {
    content += `### ${paper.title}\n`;
    content += `- Authors: ${paper.authors}\n`;
    content += `- Venue: ${paper.venue}\n`;
    content += `- Read: ${paper.read ? 'Yes' : 'No'}\n`;
    content += `- Added: ${paper.addedAt}\n\n`;
    if (paper.summary) content += `#### Summary\n${paper.summary}\n\n`;
    if (paper.takeaway) content += `#### Takeaway\n> ${paper.takeaway}\n\n`;
  });

  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tasktrack-export-${new Date().toISOString().split('T')[0]}.md`;
  a.click();
  URL.revokeObjectURL(url);
}
