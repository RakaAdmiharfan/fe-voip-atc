import { PUT } from "../app/api/channel/[id]/route";
import { db } from "../lib/db";
import { getSessionUser } from "../lib/auth";

jest.mock("../lib/db", () => ({
  db: {
    query: jest.fn(),
  },
}));
jest.spyOn(console, "error").mockImplementation(() => {});

jest.mock("../lib/auth", () => ({
  getSessionUser: jest.fn(),
}));

describe("PUT /api/channel/[id]", () => {
  it("should update a channel", async () => {
    (getSessionUser as jest.Mock).mockResolvedValue({ id: 1 });

    (db.query as jest.Mock)
      .mockResolvedValueOnce([[{ id: 123, name: "old", creator_id: 1 }]]) // check channel exists
      .mockResolvedValueOnce([[]]) // check name uniqueness
      .mockResolvedValueOnce([{ affectedRows: 1 }]); // update

    const req = {
      json: async () => ({ name: "new-channel", type: "private" }),
    } as any;

    const context = { params: { id: "123" } };
    const res = await PUT(req, context);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.message).toBe("Channel updated");
  });

  it("should fail if not creator", async () => {
    (getSessionUser as jest.Mock).mockResolvedValue({ id: 2 });

    (db.query as jest.Mock).mockResolvedValueOnce([
      [{ id: 123, name: "old", creator_id: 1 }],
    ]);

    const req = {
      json: async () => ({ name: "new", type: "public" }),
    } as any;
    const context = { params: { id: "123" } };

    const res = await PUT(req, context);
    expect(res.status).toBe(403);
  });
});
