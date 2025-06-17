import { DELETE } from "../app/api/channel/[id]/route";
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

describe("DELETE /api/channel/[id]", () => {
  it("should delete the channel", async () => {
    (getSessionUser as jest.Mock).mockResolvedValue({ id: 1 });

    (db.query as jest.Mock)
      .mockResolvedValueOnce([[{ id: 123, creator_id: 1 }]]) // find channel
      .mockResolvedValueOnce([]) // delete members
      .mockResolvedValueOnce([]); // delete channel

    const req = {} as any;
    const context = { params: { id: "123" } };

    const res = await DELETE(req, context);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.message).toBe("Channel deleted");
  });

  it("should return 404 if channel not found", async () => {
    (getSessionUser as jest.Mock).mockResolvedValue({ id: 1 });

    (db.query as jest.Mock).mockResolvedValueOnce([[]]);

    const req = {} as any;
    const context = { params: { id: "999" } };

    const res = await DELETE(req, context);
    expect(res.status).toBe(404);
  });
});

