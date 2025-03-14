import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import ReaderDashboard from "../Pages/ReaderDashboard";
import React from "react";
import "@testing-library/jest-dom";
import toast from "react-hot-toast";


// Mock dependencies
jest.mock("axios");
jest.mock("react-hot-toast", () => ({
    __esModule: true,
    default: jest.fn((message) => message),
    success: jest.fn(),
    error: jest.fn,
    Toaster: () => <div data-testid="toast-container" />
}));

// Mock localStorage
const mockLocalStorage = (() => {
    let store = {};
    return {
        getItem: jest.fn(key => store[key] || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InZhbm5pQGdtYWlsLmNvbSIsImlkIjoyMiwicm9sZSI6InJlYWRlciJ9.wGaBTn64XJXvuaoitlO6K4vLPp0IZapvtoBRvIBnDwI"),
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

// Mock react-icons
jest.mock("react-icons/bs", () => ({
    BsSearch: () => <div data-testid="search-icon" />
}));

describe("ReaderDashboard Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("renders reader dashboard with correct title", async () => {
        // Mock API response
        axios.get.mockResolvedValueOnce({ data: { Books: [] } });

        await act(async () => {
            render(
                <MemoryRouter>
                    <ReaderDashboard />
                </MemoryRouter>
            );
        });

        expect(screen.getByText("Dashboard")).toBeInTheDocument();
        // expect(screen.getByText("Recently added books")).toBeInTheDocument();
    });

    test("fetches and displays recently added books", async () => {
        const mockBooks = [
            {
                title: "aa",
                authors: "sa",
                version: "2",
                available_copies: 1
            }
        ];

        axios.get.mockResolvedValueOnce({ data: { Books: mockBooks } });

        render(
            <MemoryRouter>
                <ReaderDashboard />
            </MemoryRouter>
        );

        // Wait for the books to be displayed
        await waitFor(() => {
            expect(screen.getByText("Title aa")).toBeInTheDocument();
            expect(screen.getByText("Author sa")).toBeInTheDocument();
            expect(screen.getByText("Version 2")).toBeInTheDocument();
            // expect(screen.getByText("Available copies 5")).toBeInTheDocument();
        });

        // Verify API was called correctly
        expect(axios.get).toHaveBeenCalledWith(
            "http://localhost:8000/api/reader/getBooks",
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InZhbm5pQGdtYWlsLmNvbSIsImlkIjoyMiwicm9sZSI6InJlYWRlciJ9.wGaBTn64XJXvuaoitlO6K4vLPp0IZapvtoBRvIBnDwI"
                }
            }
        );
    });

    // test("performs search and displays search results", async () => {
    //     axios.get.mockResolvedValueOnce({ data: { Books: [] } });

    //     const searchResults = [
    //         {
    //             title: "aa",
    //             authors: "sa",
    //             version: "2",
    //             available_copies: 1
    //         }
    //     ];
    //     jest.mock("axios");

    //     axios.get.mockResolvedValueOnce({
    //         data: {
    //             Books: [{ title: "Title aa" }], 
    //         },
    //     });


    //     render(
    //         <MemoryRouter>
    //             <ReaderDashboard />
    //         </MemoryRouter>
    //     );

    //     // Enter search value
    //     const searchInput = screen.getByPlaceholderText("Search for author, title, publisher");
    //     await userEvent.type(searchInput, "search term");

    //     // Click search button
    //     const searchButton = screen.getByTestId("search-icon");
    //     fireEvent.click(searchButton);

    //     // Wait for search results to be displayed
    //     // await waitFor(() => {
    //     //     expect(screen.getByText("Title aa")).toBeInTheDocument();
    //     //     expect(screen.getByText(/Title aa/)).toBeInTheDocument();
    //     //     // expect(screen.getByText("Author Search Author")).toBeInTheDocument();
    //     //     // expect(screen.getByText("Version 2.0")).toBeInTheDocument();
    //     //     // expect(screen.getByText("Available copies 3")).toBeInTheDocument();
    //     // });
    //     const list = screen.getByRole("available");
    //     expect(list).not.toBeEmptyDOMElement();
    //     expect(screen.getByText(/Title aa/i)).toBeInTheDocument();

    //     // Verify search API was called correctly
    //     expect(axios.get).toHaveBeenCalledWith(
    //         "http://localhost:8000/api/reader/search-books?q=aa",
    //         {
    //             headers: {
    //                 "Content-Type": "application/json",
    //                 "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InZhbm5pQGdtYWlsLmNvbSIsImlkIjoyMiwicm9sZSI6InJlYWRlciJ9.wGaBTn64XJXvuaoitlO6K4vLPp0IZapvtoBRvIBnDwI"
    //             }
    //         }
    //     );
    // });

    test("handles empty search input", async () => {
        // Mock initial books load
        axios.get.mockResolvedValueOnce({ data: { Books: [] } });

        render(
            <MemoryRouter>
                <ReaderDashboard />
            </MemoryRouter>
        );

        // Don't enter any search value
        const searchInput = screen.getByPlaceholderText("Search for author, title, publisher");
        await userEvent.clear(searchInput);

        // Click search button
        const searchButton = screen.getByTestId("search-icon");
        fireEvent.click(searchButton);

        // Verify search API was not called
        expect(axios.get).not.toHaveBeenCalledWith(
            expect.stringContaining("search-books"),
            expect.any(Object)
        );
    });

    // test("raises request for a book successfully", async () => {
    //     const mockBooks = [
    //         {
    //             title: "aa",
    //             authors: "sa",
    //             version: "2",
    //             available_copies: 1
    //         }
    //     ];
    //     axios.get.mockResolvedValueOnce({ data: { Books: mockBooks } });
    //     axios.get.mockResolvedValueOnce({ data: { message: "Book requested successfully" } });

    //     render(
    //         <MemoryRouter>
    //             <ReaderDashboard />
    //         </MemoryRouter>
    //     );
    //     await waitFor(() => {
    //         expect(screen.getByText("Title aa")).toBeInTheDocument();
    //     });

    //     const requestButton = screen.getByText("Request Book");
    //     fireEvent.click(requestButton);


    //     await waitFor(() => {
    //         expect(toast.error).toHaveBeenCalledWith("The book has been already requested by you");
    //     });

    //     expect(axios.get).toHaveBeenCalledWith(
    //         "http://localhost:8000/api/reader/raise-request/kdk",
    //         {
    //             headers: {
    //                 "Content-Type": "application/json",
    //                 "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InZhbm5pQGdtYWlsLmNvbSIsImlkIjoyMiwicm9sZSI6InJlYWRlciJ9.wGaBTn64XJXvuaoitlO6K4vLPp0IZapvtoBRvIBnDwI"
    //             }
    //         }
    //     );
    // });
});