const { uploadMemoryImage } = require("../services/memoryService");

describe("memoryService upload fallback", () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...originalEnv };
        delete process.env.CLOUDINARY_CLOUD_NAME;
        delete process.env.CLOUDINARY_API_KEY;
        delete process.env.CLOUDINARY_API_SECRET;
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    it("returns a data URL when Cloudinary credentials are not configured", async () => {
        const result = await uploadMemoryImage(Buffer.from("test-image"), "photo.png");

        expect(result).toMatchObject({
            public_id: null,
        });
        expect(result.secure_url).toMatch(/^data:image\/png;base64,/);
    });
});
