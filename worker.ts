import handler from "vinext/server/fetch-handler";

const worker: ExportedHandler<Cloudflare.Env> = {
  fetch(request, environment, context) {
    return handler.fetch(request, environment, context);
  },
  async scheduled(_controller, environment) {
    if (!environment.DB) {
      console.error("Visitor retention cleanup skipped: D1 binding DB is unavailable.");
      return;
    }
    // Cloudflare Cron 每日觸發，移除超過 90 天的匿名訪客事件。
    await environment.DB.prepare("DELETE FROM visitor_events WHERE visited_at < datetime('now', '-90 days')").run();
  },
};

export default worker;
