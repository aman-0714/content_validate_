const IdeaAnalysis = require('../models/IdeaAnalysis.model');
const crypto = require('crypto');
const PDFDocument = require('pdfkit');

// ─── helpers ────────────────────────────────────────────────────────────────

const verdictColor = (v) => {
  const map = { Excellent: '#34d399', Good: '#60a5fa', Average: '#fbbf24', Poor: '#f87171' };
  return map[v] || '#a78bfa';
};

const scoreBar = (doc, label, score, y, x = 60) => {
  const BAR_W = 200;
  const filled = Math.round((score / 100) * BAR_W);
  const barColor = score >= 70 ? '#34d399' : score >= 40 ? '#fbbf24' : '#f87171';

  doc.fontSize(10).fillColor('#94a3b8').text(label, x, y);
  doc.rect(x + 130, y + 1, BAR_W, 10).fill('#1e293b');
  doc.rect(x + 130, y + 1, filled, 10).fill(barColor);
  doc.fillColor('#ffffff').text(`${score}`, x + 340, y, { width: 30, align: 'right' });
};

// ─── GET /api/export/:id/pdf ─────────────────────────────────────────────────

exports.downloadPDF = async (req, res) => {
  try {
    const analysis = await IdeaAnalysis.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!analysis) {
      return res.status(404).json({ success: false, message: 'Analysis not found' });
    }

    const doc = new PDFDocument({ size: 'A4', margin: 50, info: { Title: analysis.title } });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${analysis.title.replace(/[^a-z0-9]/gi, '_').slice(0, 60)}_report.pdf"`
    );
    doc.pipe(res);

    // ── Cover banner ──
    doc.rect(0, 0, 595, 110).fill('#0f172a');
    doc.rect(0, 100, 595, 4).fill(verdictColor(analysis.verdict));

    doc.fontSize(22).fillColor('#ffffff').text(analysis.title, 50, 22, { width: 420, ellipsis: true });
    doc.fontSize(11).fillColor('#94a3b8').text(
      `Analyzed on ${new Date(analysis.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`,
      50, 60
    );
    doc.fontSize(13).fillColor(verdictColor(analysis.verdict)).text(
      `${analysis.verdict} Idea  ·  Overall Score: ${analysis.overallScore}/100`,
      50, 80
    );

    doc.moveDown(3);

    // ── Scores section ──
    doc.fontSize(14).fillColor('#e2e8f0').text('Score Breakdown', 50, 130);
    doc.rect(50, 148, 495, 1).fill('#1e293b');

    const scores = [
      { label: 'Competition',     score: analysis.competitionScore },
      { label: 'Demand',          score: analysis.demandScore },
      { label: 'Originality',     score: analysis.originalityScore },
      { label: 'Viral Potential', score: analysis.viralScore },
    ];

    let y = 158;
    scores.forEach(s => {
      scoreBar(doc, s.label, s.score, y);
      y += 22;
    });

    // Confidence & Execution difficulty if present
    if (analysis.confidenceScore) {
      scoreBar(doc, 'Confidence',           analysis.confidenceScore,    y);     y += 22;
    }
    if (analysis.executionDifficulty) {
      scoreBar(doc, 'Execution Difficulty', analysis.executionDifficulty, y);    y += 22;
    }

    y += 10;

    // ── Trend data ──
    if (analysis.trendData) {
      const td = analysis.trendData;
      doc.rect(50, y, 495, 1).fill('#1e293b'); y += 10;
      doc.fontSize(14).fillColor('#e2e8f0').text('Trend Signals', 50, y); y += 22;

      const trendItems = [
        `Reddit signals: ${td.redditSignals}`,
        `Total upvotes: ${td.totalUpvotes}`,
        `YouTube videos found: ${td.youtubeVideos}`,
        `Avg views: ${td.avgViews?.toLocaleString() || 0}`,
        `Recent uploads: ${td.recentUploads}`,
        `Avg like/view ratio: ${(td.avgLikeViewRatio || 0).toFixed(3)}`,
      ];
      trendItems.forEach(item => {
        doc.fontSize(10).fillColor('#94a3b8').text(`• ${item}`, 60, y); y += 15;
      });
      y += 8;
    }

    // ── Keywords ──
    if (analysis.keywords?.length) {
      doc.rect(50, y, 495, 1).fill('#1e293b'); y += 10;
      doc.fontSize(14).fillColor('#e2e8f0').text('Keywords', 50, y); y += 20;
      doc.fontSize(10).fillColor('#a78bfa').text(analysis.keywords.join('  ·  '), 60, y, { width: 470 });
      y += 28;
    }

    // ── Competitors ──
    if (analysis.competitors?.length) {
      if (y > 680) { doc.addPage(); y = 50; }
      doc.rect(50, y, 495, 1).fill('#1e293b'); y += 10;
      doc.fontSize(14).fillColor('#e2e8f0').text('Top Competitors', 50, y); y += 20;
      analysis.competitors.slice(0, 5).forEach(c => {
        doc.fontSize(10).fillColor('#e2e8f0').text(`${c.name}`, 60, y);
        doc.fillColor('#64748b').text(`${c.dominance || ''}  ${c.views ? `· ${c.views.toLocaleString()} views` : ''}`, 180, y);
        y += 16;
      });
      y += 10;
    }

    // ── Market Gaps ──
    if (analysis.marketGaps?.length) {
      if (y > 680) { doc.addPage(); y = 50; }
      doc.rect(50, y, 495, 1).fill('#1e293b'); y += 10;
      doc.fontSize(14).fillColor('#e2e8f0').text('Market Gaps', 50, y); y += 20;
      analysis.marketGaps.forEach(gap => {
        doc.fontSize(10).fillColor('#34d399').text(`[${gap.type || 'gap'}]`, 60, y);
        doc.fillColor('#94a3b8').text(gap.description || '', 120, y, { width: 410 });
        y += 18;
      });
      y += 8;
    }

    // ── Recommendations (new page if needed) ──
    if (analysis.recommendations?.length) {
      if (y > 600) { doc.addPage(); y = 50; }
      doc.rect(50, y, 495, 1).fill('#1e293b'); y += 10;
      doc.fontSize(14).fillColor('#e2e8f0').text('AI Recommendations', 50, y); y += 20;
      analysis.recommendations.forEach((rec, i) => {
        if (y > 720) { doc.addPage(); y = 50; }
        doc.fontSize(10).fillColor('#94a3b8').text(`${i + 1}. ${rec}`, 60, y, { width: 470 }); y += 18;
      });
      y += 8;
    }

    // ── Winning Angles ──
    if (analysis.betterAngles?.length) {
      if (y > 620) { doc.addPage(); y = 50; }
      doc.rect(50, y, 495, 1).fill('#1e293b'); y += 10;
      doc.fontSize(14).fillColor('#e2e8f0').text('Winning Angles', 50, y); y += 20;
      analysis.betterAngles.forEach((angle, i) => {
        if (y > 720) { doc.addPage(); y = 50; }
        doc.fontSize(10).fillColor('#a78bfa').text(`${i + 1}.`, 60, y);
        doc.fillColor('#e2e8f0').text(angle, 80, y, { width: 450 }); y += 18;
      });
      y += 8;
    }

    // ── AI Report sections ──
    if (analysis.aiReport) {
      const sections = [
        { key: 'competitionAnalysis',      title: 'Competition Analysis' },
        { key: 'audienceInterestAnalysis', title: 'Audience Interest' },
        { key: 'originalityAssessment',    title: 'Originality & Gap' },
        { key: 'viralPotential',           title: 'Viral Potential' },
        { key: 'suggestedImprovements',    title: 'Suggested Improvements' },
      ];
      sections.forEach(s => {
        if (!analysis.aiReport[s.key]) return;
        doc.addPage();
        doc.rect(0, 0, 595, 6).fill('#a78bfa');
        doc.fontSize(16).fillColor('#e2e8f0').text(s.title, 50, 24);
        doc.fontSize(10).fillColor('#94a3b8').text(analysis.aiReport[s.key], 50, 55, { width: 495, lineGap: 4 });
      });
    }

    // ── Footer on last page ──
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(pages.start + i);
      doc.fontSize(8).fillColor('#334155').text(
        `IdeaValidator  ·  Page ${i + 1} of ${pages.count}  ·  ${new Date().toLocaleDateString()}`,
        50, 820, { align: 'center', width: 495 }
      );
    }

    doc.end();
  } catch (error) {
    console.error('PDF export error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── POST /api/export/:id/share  (generate / revoke share token) ─────────────

exports.generateShareLink = async (req, res) => {
  try {
    const analysis = await IdeaAnalysis.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!analysis) {
      return res.status(404).json({ success: false, message: 'Analysis not found' });
    }

    // If already shared → return existing token
    if (analysis.shareToken) {
      return res.json({ success: true, shareToken: analysis.shareToken, alreadyExisted: true });
    }

    // Generate a secure random token
    const token = crypto.randomBytes(24).toString('hex');
    analysis.shareToken = token;
    analysis.sharedAt = new Date();
    await analysis.save();

    res.json({ success: true, shareToken: token });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── DELETE /api/export/:id/share  (revoke share) ────────────────────────────

exports.revokeShareLink = async (req, res) => {
  try {
    const analysis = await IdeaAnalysis.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!analysis) {
      return res.status(404).json({ success: false, message: 'Analysis not found' });
    }

    analysis.shareToken = null;
    analysis.sharedAt = null;
    await analysis.save();

    res.json({ success: true, message: 'Share link revoked' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/shared/:token  (public — no auth) ──────────────────────────────

exports.getSharedReport = async (req, res) => {
  try {
    const analysis = await IdeaAnalysis.findOne({ shareToken: req.params.token })
      .select('-userId -youtubeResults -redditResults -__v');  // strip heavy/private fields

    if (!analysis) {
      return res.status(404).json({ success: false, message: 'Shared report not found or link has been revoked.' });
    }

    res.json({ success: true, data: analysis });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
