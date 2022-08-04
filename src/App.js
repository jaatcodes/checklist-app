import { useQuery, useMutation } from "@apollo/react-hooks";
import { gql } from "apollo-boost";
import { useState } from "react";

const GET_TODOS = gql`
    query getTodos {
        todos {
            done
            id
            text
        }
    }
`;

const TOGGLE_TODO = gql`
    mutation toggleTodo($id: uuid!, $done: Boolean!) {
        update_todos(where: { id: { _eq: $id } }, _set: { done: $done }) {
            returning {
                done
                id
                text
            }
        }
    }
`;

const ADD_TODO = gql`
    mutation addTodo($text: String!) {
        insert_todos(objects: { text: $text }) {
            returning {
                text
                id
                done
            }
        }
    }
`;

const DELETE_TODO = gql`
    mutation deleteTodo($id: uuid!) {
        delete_todos(where: { id: { _eq: $id } }) {
            returning {
                done
            }
        }
    }
`;

function App() {
    const [formInput, setFormInput] = useState("");

    const { data, loading, error } = useQuery(GET_TODOS);

    const [toggleTodos] = useMutation(TOGGLE_TODO);
    const [addTodo] = useMutation(ADD_TODO, {
        onCompleted: () => setFormInput(""),
    });
    const [deleteTodo] = useMutation(DELETE_TODO);

    async function handleToggleTodo(todo) {
        const data = await toggleTodos({
            variables: { id: todo.id, done: !todo.done },
        });
        console.log(data);
    }
    async function handleAddTodo(e) {
        e.preventDefault();
        //check if we have an empty input submission
        if (!formInput.trim()) return;

        const data = await addTodo({
            variables: { text: formInput },
            // to update we refetch the GET_TODOS query
            refetchQueries: [{ query: GET_TODOS }],
        });
        console.log(data);
        // setFormInput("");
    }

    async function handleDeleteTodo(id) {
        const isConfirmend = window.confirm("Do you want to DELETE the todo");
        if (isConfirmend) {
            const data = await deleteTodo({
                variables: { id },
                // we can refetch to show that we deleted the todo
                // refetchQueries: [{ query: GET_TODOS }],
                // or we an change the catch manually to update the data of GET_TODOS
                update: (cache) => {
                    const prevData = cache.readQuery({ query: GET_TODOS });
                    const newTodos = prevData.todos.filter(
                        (todo) => todo.id !== id,
                    );
                    cache.writeQuery({
                        query: GET_TODOS,
                        data: { todos: newTodos },
                    });
                },
            });
        }
    }

    if (loading) return <>Loading Todos ...</>;
    if (error) return <>Error Fetching Todos...</>;
    else
        return (
            <div className='vh-100 code flex flex-column items-center bg-purple white pa3 fl-1 '>
                <h1 className='f1-l'>Check List</h1>
                {/* todo form */}
                <form onSubmit={handleAddTodo} className='mb3 '>
                    <input
                        className='pa2 f4 bn br4'
                        type='text'
                        placeholder='Enter your todo'
                        onChange={(e) => setFormInput(e.target.value)}
                        value={formInput}
                    />
                    <button
                        className='pa2 f4 bn br4 . bg-green grow'
                        type='submit'>
                        Create Todo
                    </button>
                </form>
                <div className='flex items-center justify-center flex-column'>
                    {/* todolist */}
                    {data.todos.map((todo) => (
                        <p
                            key={todo.id}
                            onDoubleClick={() => handleToggleTodo(todo)}>
                            <span
                                className={`pointer list pa1 f3 ${
                                    todo.done && "strike"
                                }`}>
                                {todo.text}
                            </span>
                            <button
                                className='bg-transparent bn f2 pointer'
                                onClick={() => handleDeleteTodo(todo.id)}>
                                <span className='red'>&times;</span>
                            </button>
                        </p>
                    ))}
                </div>
            </div>
        );
}

export default App;
