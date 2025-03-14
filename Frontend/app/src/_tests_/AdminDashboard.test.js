import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import AdminDashboard from "../Pages/AdminDashboard";
import React from "react";
import "@testing-library/jest-dom";
import toast from "react-hot-toast";

// Mock dependencies
jest.mock("axios");
jest.mock("react-hot-toast", () => ({
    __esModule: true,
    default: {
        success: jest.fn(),
        error: jest.fn()
    },
    Toaster: () => <div data-testid="toast-container" />
}));

// Mock localStorage
const mockLocalStorage = (() => {
    let store = {};
    return {
        getItem: jest.fn(key => store[key] || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImRrQGdtYWlsLmNvbSIsImlkIjoyMCwicm9sZSI6ImFkbWluIn0.kv_iVezrPhrcTPF5JvIR6siTGouZQ32WTMd0jN8uVOA"),
        setItem: jest.fn((key, value) => {
            store[key] = value;
        }),
        clear: jest.fn(() => {
            store = {};
        })
    };
})();

Object.defineProperty(window, "localStorage", {
    value: mockLocalStorage,
    writable: true
});

describe("AdminDashboard Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockLocalStorage.getItem.mockReturnValue("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImRrQGdtYWlsLmNvbSIsImlkIjoyMCwicm9sZSI6ImFkbWluIn0.kv_iVezrPhrcTPF5JvIR6siTGouZQ32WTMd0jN8uVOA");
    });

    test("renders admin dashboard with correct title", () => {
        // Mock API responses
        axios.get.mockImplementation((url) => {
            if (url === "http://localhost:8000/api/admin/getBooks") {
                return Promise.resolve({ data: { Books: [] } });
            }
            if (url === "http://localhost:8000/api/admin/list-requests") {
                return Promise.resolve({ data: { message: [] } });
            }
            return Promise.reject(new Error("Not found"));
        });

        render(
            <MemoryRouter>
                <AdminDashboard />
            </MemoryRouter>
        );

        expect(screen.getByText("Welcome Admin")).toBeInTheDocument();
        expect(screen.getByText("List Books")).toBeInTheDocument();
        expect(screen.getByText("Requests")).toBeInTheDocument();
    });

    test("fetches and displays books", async () => {
        const mockBooks = [
            {
                isbn: "kdk",
                title: "aa",
                authors: "sa",
                // publisher: "Test Publisher",
                version: 2,
                available_copies: 1
            }
        ];

        axios.get.mockImplementation((url) => {
            if (url === "http://localhost:8000/api/admin/getBooks") {
                return Promise.resolve({ data: { Books: mockBooks } });
            }
            if (url === "http://localhost:8000/api/admin/list-requests") {
                return Promise.resolve({ data: { message: [] } });
            }
            return Promise.reject(new Error("Not found"));
        });

        render(
            <MemoryRouter>
                <AdminDashboard />
            </MemoryRouter>
        );

        await waitFor(() => {
            //   expect(screen.getByText("aa")).toBeInTheDocument();
            expect(screen.getByText("Title : aa")).toBeInTheDocument();
            expect(screen.getByText("Version : 2")).toBeInTheDocument();
            expect(screen.getByText("Author : sa")).toBeInTheDocument();
        });
    });

    test("fetches and displays requests", async () => {
        const mockRequests = [
            {
                // req_id: "22",
                reader_id: "22",
                book_id: "kdk"
            }
        ];

        axios.get.mockImplementation((url) => {
            if (url === "http://localhost:8000/api/admin/getBooks") {
                return Promise.resolve({ data: { Books: [] } });
            }
            if (url === "http://localhost:8000/api/admin/list-requests") {
                return Promise.resolve({ data: { message: mockRequests } });
            }
            return Promise.reject(new Error("Not found"));
        });

        render(
            <MemoryRouter>
                <AdminDashboard />
            </MemoryRouter>
        );

        await waitFor(() => {
            //   expect(screen.getByText("22")).toBeInTheDocument();
            expect(screen.getByText("Approve")).toBeInTheDocument();
            expect(screen.getByText("Reject")).toBeInTheDocument();
        });
    });

    // test("approves a request successfully", async () => {
    //     const mockRequests = [
    //         {
    //             // req_id: "req1",
    //             reader_id: "22",
    //             book_id: "kdk"
    //         }
    //     ];

    //     axios.get.mockImplementation((url) => {
    //         if (url === "http://localhost:8000/api/admin/getBooks") {
    //             return Promise.resolve({ data: { Books: [] } });
    //         }
    //         if (url === "http://localhost:8000/api/admin/list-requests") {
    //             return Promise.resolve({ data: { message: mockRequests } });
    //         }
    //         return Promise.reject(new Error("Not found"));
    //     });

    //     axios.put.mockResolvedValueOnce({ data: { message: "Request approved" } });

    //     render(
    //         <MemoryRouter>
    //             <AdminDashboard />
    //         </MemoryRouter>
    //     );

    //     await waitFor(() => {
    //         // expect(screen.getByText("Reader id : 22 requested book")).toBeInTheDocument();
    //         expect(screen.getByText(/Reader Id : 22 requested book/i)).toBeInTheDocument();

    //     });

    //     fireEvent.click(screen.getByText("Approve"));

    //     await waitFor(() => {
    //         expect(axios.put).toHaveBeenCalledWith(
    //             "http://localhost:8000/api/admin/5/approve",
    //             {},
    //             expect.objectContaining({
    //                 headers: expect.objectContaining({
    //                     Authorization: "Bearer mock-token"
    //                 })
    //             })
    //         );
    //         expect(toast.success).toHaveBeenCalledWith("Book approved");
    //     });
    // });

    // test("rejects a request successfully", async () => {
    //     const mockRequests = [
    //         {
    //             req_id: "req1",
    //             reader_id: "reader1",
    //             book_id: "book1"
    //         }
    //     ];

    //     axios.get.mockImplementation((url) => {
    //         if (url === "http://localhost:8000/api/admin/getBooks") {
    //             return Promise.resolve({ data: { Books: [] } });
    //         }
    //         if (url === "http://localhost:8000/api/admin/list-requests") {
    //             return Promise.resolve({ data: { message: mockRequests } });
    //         }
    //         return Promise.reject(new Error("Not found"));
    //     });

    //     axios.put.mockResolvedValueOnce({ data: { message: "Request rejected" } });

    //     render(
    //         <MemoryRouter>
    //             <AdminDashboard />
    //         </MemoryRouter>
    //     );

    //     await waitFor(() => {
    //         expect(screen.getByText("reader1 requested book1")).toBeInTheDocument();
    //     });

    //     fireEvent.click(screen.getByText("Reject"));

    //     await waitFor(() => {
    //         expect(axios.put).toHaveBeenCalledWith(
    //             "http://localhost:8000/api/admin/req1/reject",
    //             {},
    //             expect.objectContaining({
    //                 headers: expect.objectContaining({
    //                     Authorization: "Bearer mock-token"
    //                 })
    //             })
    //         );
    //         expect(toast.success).toHaveBeenCalledWith("Book request rejected");
    //     });
    // });

    test("opens add book modal when add book button is clicked", async () => {
        axios.get.mockImplementation((url) => {
            if (url === "http://localhost:8000/api/admin/getBooks") {
                return Promise.resolve({ data: { Books: [] } });
            }
            if (url === "http://localhost:8000/api/admin/list-requests") {
                return Promise.resolve({ data: { message: [] } });
            }
            return Promise.reject(new Error("Not found"));
        });

        render(
            <MemoryRouter>
                <AdminDashboard />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByText("Add Book"));

        expect(screen.getByText("Add Book", { selector: "h2" })).toBeInTheDocument();
        expect(screen.getByPlaceholderText("ISBN")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Title")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Authors")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Publisher")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Version")).toBeInTheDocument();
    });

    test("adds a book successfully", async () => {
        axios.get.mockImplementation((url) => {
            if (url === "http://localhost:8000/api/admin/getBooks") {
                return Promise.resolve({ data: { Books: [] } });
            }
            if (url === "http://localhost:8000/api/admin/list-requests") {
                return Promise.resolve({ data: { message: [] } });
            }
            return Promise.reject(new Error("Not found"));
        });

        axios.post.mockResolvedValueOnce({ data: { message: "Book added successfully" } });

        render(
            <MemoryRouter>
                <AdminDashboard />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByText("Add Book"));

        const isbnInput = screen.getByPlaceholderText("ISBN");
        const titleInput = screen.getByPlaceholderText("Title");
        const authorsInput = screen.getByPlaceholderText("Authors");
        const publisherInput = screen.getByPlaceholderText("Publisher");
        const versionInput = screen.getByPlaceholderText("Version");

        fireEvent.change(isbnInput, { target: { value: "1234567890" } });
        fireEvent.change(titleInput, { target: { value: "Test Book" } });
        fireEvent.change(authorsInput, { target: { value: "Test Author" } });
        fireEvent.change(publisherInput, { target: { value: "Test Publisher" } });
        fireEvent.change(versionInput, { target: { value: "1" } });

        // fireEvent.click(screen.getByText("Add Book", { selector: "button" }));
        // fireEvent.click(screen.getByText("Add Book", { role: "add book" }));
        //  expect(screen.getByTestId("add-book-btn")).toBeInTheDocument();

        fireEvent.submit(screen.getByTestId("add-book-btn"));


        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(
                "http://localhost:8000/api/admin/add-book",
                {
                    isbn: "1234567890",
                    title: "Test Book",
                    authors: "Test Author",
                    publisher: "Test Publisher",
                    version: 1
                },
                expect.objectContaining({
                    headers: expect.objectContaining({
                        Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImRrQGdtYWlsLmNvbSIsImlkIjoyMCwicm9sZSI6ImFkbWluIn0.kv_iVezrPhrcTPF5JvIR6siTGouZQ32WTMd0jN8uVOA"
                    })
                })
            );
            expect(toast.success).toHaveBeenCalledWith("Book added successfully!");
        });
    });

    test("removes a book successfully", async () => {
        const mockBooks = [
            {
                isbn: "kdk",
                title: "aa",
                authors: "sa",
                // publisher: "Test Publisher",
                version: 2,
                available_copies: 1
            }
        ];
        axios.get.mockImplementation((url) => {
            if (url === "http://localhost:8000/api/admin/getBooks") {
                return Promise.resolve({ data: { Books: mockBooks } });
            }
            if (url === "http://localhost:8000/api/admin/list-requests") {
                return Promise.resolve({ data: { message: [] } });
            }
            return Promise.reject(new Error("Not found"));
        });

        axios.delete.mockResolvedValueOnce({ data: { message: "Book removed successfully" } });

        render(
            <MemoryRouter>
                <AdminDashboard />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("Title : aa")).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText("Remove"));

        await waitFor(() => {
            expect(axios.delete).toHaveBeenCalledWith(
                "http://localhost:8000/api/admin/kdk",
                expect.objectContaining({
                    headers: expect.objectContaining({
                        Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImRrQGdtYWlsLmNvbSIsImlkIjoyMCwicm9sZSI6ImFkbWluIn0.kv_iVezrPhrcTPF5JvIR6siTGouZQ32WTMd0jN8uVOA"
                    })
                })
            );
            expect(toast.success).toHaveBeenCalledWith("Book removed successfully!");
        });
    });

    test("updates a book successfully", async () => {
        const mockBooks = [
            {
                isbn: "kdk",
                title: "aa",
                authors: "sa",
                // publisher: "Test Publisher",
                version: 2,
                available_copies: 1
            }
        ];

        axios.get.mockImplementation((url) => {
            if (url === "http://localhost:8000/api/admin/getBooks") {
                return Promise.resolve({ data: { Books: mockBooks } });
            }
            if (url === "http://localhost:8000/api/admin/list-requests") {
                return Promise.resolve({ data: { message: [] } });
            }
            return Promise.reject(new Error("Not found"));
        });

        // Mock fetch instead of axios for update
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ message: "Book updated successfully" })
            })
        );

        render(
            <MemoryRouter>
                <AdminDashboard />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("Title : aa")).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText("Update"));

        const titleInput = screen.getByPlaceholderText("Enter Title");
        const authorInput = screen.getByPlaceholderText("Enter Author");
        const publisherInput = screen.getByPlaceholderText("Enter Publisher");
        const versionInput = screen.getByPlaceholderText("Enter Version");

        fireEvent.change(titleInput, { target: { value: "Updated Book" } });
        fireEvent.change(authorInput, { target: { value: "Updated Author" } });
        fireEvent.change(publisherInput, { target: { value: "Updated Publisher" } });
        fireEvent.change(versionInput, { target: { value: "3" } });

        fireEvent.click(screen.getByText("Submit"));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                "http://localhost:8000/api/admin/kdk",
                expect.objectContaining({
                    method: "PUT",
                    headers: expect.objectContaining({
                        Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImRrQGdtYWlsLmNvbSIsImlkIjoyMCwicm9sZSI6ImFkbWluIn0.kv_iVezrPhrcTPF5JvIR6siTGouZQ32WTMd0jN8uVOA"
                    }),
                    body: JSON.stringify({
                        title: "Updated Book",
                        authors: "Updated Author",
                        publisher: "Updated Publisher",
                        version: 3
                    })
                })
            );
            expect(toast.success).toHaveBeenCalledWith("Book updated successfully!");
        });

        // Clean up
        global.fetch.mockClear();
        delete global.fetch;
    });
});



//fireEvent.click(screen.getByTestId("add-book-button")); i think would work for all