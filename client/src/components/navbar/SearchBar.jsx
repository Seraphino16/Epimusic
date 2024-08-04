import React from "react";

function SearchBar() {
    return (
        <div className="pt-2 flex flex-row relative mx-auto text-gray-600 w-1/2">
            <div className="relative w-full">
                <input
                    className="border-2 border-gray-300 bg-white h-10 pl-5 pr-10 rounded-full text-sm focus:outline-none w-full"
                    type="search"
                    name="search"
                    placeholder="Rechercher un article..."
                />
                <button
                    type="submit"
                    className="absolute right-0 rounded-full bg-transparent"
                >
                    <svg
                        className="h-5 w-5 fill-current text-gray-600"
                        xmlns="http://www.w3.org/2000/svg"
                        version="1.1"
                        id="Capa_1"
                        x="0px"
                        y="0px"
                        viewBox="0 0 30.239 30.239"
                        style={{ enableBackground: "new 0 0 30.239 30.239" }}
                        xmlSpace="preserve"
                        width="512px"
                        height="512px"
                    >
                        <g>
                            <path
                                d="M20.126,17.96c1.262-1.675,2.015-3.761,2.015-6.016C22.141,5.366,17.775,1,12.07,1C6.364,1,2,5.366,2,11.074
                s4.366,10.074,10.074,10.074c2.255,0,4.341-0.753,6.016-2.015l8.105,8.105c0.293,0.293,0.678,0.439,1.063,0.439
                s0.77-0.146,1.063-0.439c0.586-0.586,0.586-1.538,0-2.125L20.126,17.96z M12.074,18.641c-4.169,0-7.567-3.398-7.567-7.567
                s3.398-7.567,7.567-7.567s7.567,3.398,7.567,7.567S16.243,18.641,12.074,18.641z"
                            />
                        </g>
                    </svg>
                </button>
            </div>
        </div>
    );
}

export default SearchBar;
