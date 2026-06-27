import React, { useState, useEffect } from 'react';
import { api, fmtRiyal, fmtDate } from '@/utils/api';

interface User {
  user_id: number;
  public_id: string;
  username: string;
  phone: string;
  account_balance: number;
  is_admin: boolean;
  created_at: string;
  ticket_count: number;
  deposit_count: number;
  win_count: number;
}

interface UserDetail {
  user_id: number;
  public_id: string;
  username: string;
  phone: string;
  account_balance: number;
  is_admin: boolean;
  created_at: string;
  ticket_count: number;
  deposit_count: number;
  win_count: number;
  deposits: any[];
  tickets: any[];
  wins: any[];
}

export default function UsersView() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);

  const loadUsers = async (query: string = '') => {
    setLoading(true);
    try {
      const url = query ? `/api/admin/users?q=${encodeURIComponent(query)}` : '/api/admin/users';
      const data = await api(url, { auth: true });
      setUsers(data || []);
    } catch (err: any) {
      console.error('Failed to load users:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers(searchQuery);
  };

  const handleUserClick = async (user: User) => {
    setDetailLoading(true);
    setSelectedUser(null);
    try {
      const data = await api(`/api/admin/users/${user.user_id}`, { auth: true });
      setSelectedUser(data);
    } catch (err: any) {
      console.error('Failed to load user details:', err.message);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setSelectedUser(null);
  };

  return (
    <div className="bg-surface border border-borderCustom p-6 shadow-sm rounded-2xl">
      <div className="md:flex md:flex-wrap md:items-center md:justify-between gap-4 mb-4">
        <h3 className="font-space text-xl font-bold text-textCustom mb-3">Registered Users</h3>
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <input
            className="w-full bg-surface2 border border-borderCustom text-textCustom px-3.5 py-1.5 rounded-xl text-sm outline-none focus:border-primaryCustom placeholder:text-textCustom/20"
            placeholder="Search ID, username, phone…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            type="submit"
            className="w-full px-4 py-1.5 rounded-xl text-xs font-semibold bg-surface2 border border-borderCustom text-textCustom hover:bg-surface3 cursor-pointer"
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      {loading ? (
        <div className="text-center py-8 text-sm text-textCustom/40">Loading users...</div>
      ) : users.length === 0 ? (
        <div className="text-center py-8 text-sm text-textCustom/40">No users found.</div>
      ) : (
        <div className="overflow-x-auto scrollbar-none">
          <table className="w-full border-collapse text-xs min-w-[800px]">
            <thead>
              <tr className="border-b border-borderCustom">
                <th className="text-center pb-3 text-[11px] font-semibold uppercase tracking-wider text-textCustom/60">ID</th>
                <th className="text-center pb-3 text-[11px] font-semibold uppercase tracking-wider text-textCustom/60">Username</th>
                <th className="text-center pb-3 text-[11px] font-semibold uppercase tracking-wider text-textCustom/60">Phone</th>
                <th className="text-center pb-3 text-[11px] font-semibold uppercase tracking-wider text-textCustom/60">Balance</th>
                <th className="text-center pb-3 text-[11px] font-semibold uppercase tracking-wider text-textCustom/60">Tickets</th>
                <th className="text-center pb-3 text-[11px] font-semibold uppercase tracking-wider text-textCustom/60">Deposits</th>
                <th className="text-center pb-3 text-[11px] font-semibold uppercase tracking-wider text-textCustom/60">Wins</th>
                <th className="text-center pb-3 text-[11px] font-semibold uppercase tracking-wider text-textCustom/60">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderCustom/40">
              {users.map((user) => (
                <tr
                  key={user.user_id}
                  className="hover:bg-surface2/40 transition-colors cursor-pointer"
                  onClick={() => handleUserClick(user)}
                >
                  <td className="py-3.5 text-center text-textCustom font-mono">{user.public_id}</td>
                  <td className="py-3.5 text-textCustom text-center font-medium">{user.username}</td>
                  <td className="py-3.5 text-center text-textCustom/70">{user.phone || '-'}</td>
                  <td className="py-3.5 text-[#10b981] text-center font-bold">{fmtRiyal(user.account_balance)}</td>
                  <td className="py-3.5 text-center text-textCustom">{user.ticket_count}</td>
                  <td className="py-3.5 text-center text-textCustom">{user.deposit_count}</td>
                  <td className="py-3.5 text-[#f59e0b] text-center font-semibold">{user.win_count}</td>
                  <td className="py-3.5 text-center text-textCustom/70 whitespace-nowrap">{fmtDate(user.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-borderCustom rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-space text-xl font-bold text-textCustom">User Details: {selectedUser.username}</h3>
              <button
                onClick={closeDetail}
                className="text-textCustom/60 hover:text-textCustom text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {detailLoading ? (
              <div className="text-center py-8 text-sm text-textCustom/40">Loading user details...</div>
            ) : (
              <div className="space-y-6">
                {/* User Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-surface2 rounded-xl">
                  <div>
                    <span className="text-[11px] font-bold text-textCustom/60 uppercase tracking-wider block mb-1">Member ID</span>
                    <span className="text-textCustom font-mono">{selectedUser.public_id}</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-textCustom/60 uppercase tracking-wider block mb-1">Username</span>
                    <span className="text-textCustom">{selectedUser.username}</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-textCustom/60 uppercase tracking-wider block mb-1">Phone</span>
                    <span className="text-textCustom">{selectedUser.phone || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-textCustom/60 uppercase tracking-wider block mb-1">Balance</span>
                    <span className="text-[#10b981] font-bold">{fmtRiyal(selectedUser.account_balance)}</span>
                  </div>
                </div>

                {/* Recent Tickets */}
                <div>
                  <h4 className="text-sm font-bold text-textCustom mb-3">Recent Tickets (Last 20)</h4>

                  {/* ── DESKTOP VIEW: Standard table layout, only visible on medium screens and up ── */}
                  <div className="hidden md:block overflow-x-auto scrollbar-none">
                    <table className="w-full border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-borderCustom">
                          <th className="text-left pb-2 text-[11px] font-semibold text-textCustom/60">ID</th>
                          <th className="text-left pb-2 text-[11px] font-semibold text-textCustom/60">Numbers</th>
                          <th className="text-left pb-2 text-[11px] font-semibold text-textCustom/60">Type</th>
                          <th className="text-left pb-2 text-[11px] font-semibold text-textCustom/60">Wager</th>
                          <th className="text-left pb-2 text-[11px] font-semibold text-textCustom/60">Status</th>
                          <th className="text-left pb-2 text-[11px] font-semibold text-textCustom/60">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-borderCustom/40">
                        {selectedUser.tickets && selectedUser.tickets.length > 0 ? (
                          selectedUser.tickets.map((ticket: any) => (
                            <tr key={ticket.ticket_id} className="hover:bg-surface2/30 transition-colors">
                              <td className="py-2 text-textCustom font-mono">#{ticket.ticket_id}</td>
                              <td className="py-2 text-[#a855f7] font-bold tracking-wider">{ticket.n1} - {ticket.n2} - {ticket.n3}</td>
                              <td className="py-2 text-textCustom capitalize">{ticket.ticket_type}</td>
                              <td className="py-2 text-textCustom">{fmtRiyal(ticket.amount_wagered)}</td>
                              <td className="py-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold capitalize ${ticket.status === 'won' ? 'bg-[#10b981]/15 text-[#10b981]' :
                                    ticket.status === 'lost' ? 'bg-[#ef4444]/15 text-[#ef4444]' :
                                      'bg-[#f59e0b]/15 text-[#f59e0b]'
                                  }`}>
                                  {ticket.status}
                                </span>
                              </td>
                              <td className="py-2 text-textCustom/70 whitespace-nowrap">{fmtDate(ticket.created_at)}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="py-4 text-center text-textCustom/40 italic">No tickets found</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* ── MOBILE VIEW: Beautifully stacked cards grid layout, only visible on small screens ── */}
                  <div className="block md:hidden">
                    {selectedUser.tickets && selectedUser.tickets.length > 0 ? (
                      <div className="grid grid-cols-1 gap-3">
                        {selectedUser.tickets.map((ticket: any) => (
                          <div key={ticket.ticket_id} className="bg-surface2 border border-borderCustom/60 p-4 rounded-xl space-y-2.5">
                            <div className="flex justify-between items-center">
                              <span className="text-textCustom font-mono font-semibold">#{ticket.ticket_id}</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${ticket.status === 'won' ? 'bg-[#10b981]/15 text-[#10b981]' :
                                  ticket.status === 'lost' ? 'bg-[#ef4444]/15 text-[#ef4444]' :
                                    'bg-[#f59e0b]/15 text-[#f59e0b]'
                                }`}>
                                {ticket.status}
                              </span>
                            </div>

                            <div className="flex justify-between items-center text-xs pt-1 border-t border-borderCustom/40">
                              <div>
                                <span className="text-textCustom/40 text-[10px] block uppercase font-bold tracking-wide">Numbers</span>
                                <span className="text-[#a855f7] font-bold text-sm tracking-wider">{ticket.n1} - {ticket.n2} - {ticket.n3}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-textCustom/40 text-[10px] block uppercase font-bold tracking-wide">Wager</span>
                                <span className="text-textCustom font-semibold">{fmtRiyal(ticket.amount_wagered)}</span>
                              </div>
                            </div>

                            <div className="flex justify-between items-center text-xs pt-1">
                              <div>
                                <span className="text-textCustom/40 text-[10px] block uppercase font-bold tracking-wide">Type</span>
                                <span className="text-textCustom capitalize font-medium">{ticket.ticket_type}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-textCustom/40 text-[10px] block uppercase font-bold tracking-wide">Date</span>
                                <span className="text-textCustom/60 text-[11px] whitespace-nowrap">{fmtDate(ticket.created_at)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-xs text-textCustom/40 bg-surface2/40 border border-dashed border-borderCustom rounded-xl italic">
                        No tickets found
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Deposits */}
                <div>
                  <h4 className="text-sm font-bold text-textCustom mb-3">Recent Deposits (Last 20)</h4>

                  {/* ── DESKTOP SCREEN RESOLUTIONS: Perfectly Centered Grid Table ── */}
                  <div className="hidden md:block overflow-x-auto scrollbar-none">
                    <table className="w-full border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-borderCustom">
                          {/* Changed all headers to text-center layout spacing attributes */}
                          <th className="text-center pb-2 text-[11px] font-semibold text-textCustom/60">ID</th>
                          <th className="text-center pb-2 text-[11px] font-semibold text-textCustom/60">PKR</th>
                          <th className="text-center pb-2 text-[11px] font-semibold text-textCustom/60">SAR</th>
                          <th className="text-center pb-2 text-[11px] font-semibold text-textCustom/60">Status</th>
                          <th className="text-center pb-2 text-[11px] font-semibold text-textCustom/60">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-borderCustom/40">
                        {selectedUser.deposits && selectedUser.deposits.length > 0 ? (
                          selectedUser.deposits.map((deposit: any) => (
                            <tr key={deposit.deposit_id} className="hover:bg-surface2/30 transition-colors text-center">
                              {/* Added explicit text-center alignments to every table data row context cell */}
                              <td className="py-2 text-center text-textCustom font-mono">#{deposit.deposit_id}</td>
                              <td className="py-2 text-center text-textCustom">PKR {Number(deposit.amount_pkr).toLocaleString()}</td>
                              <td className="py-2 text-center text-[#10b981] font-semibold">{fmtRiyal(deposit.amount_riyal)}</td>
                              <td className="py-2 text-center">
                                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold capitalize ${deposit.status === 'approved' ? 'bg-[#10b981]/15 text-[#10b981]' :
                                    deposit.status === 'rejected' ? 'bg-[#ef4444]/15 text-[#ef4444]' :
                                      'bg-[#f59e0b]/15 text-[#f59e0b]'
                                  }`}>
                                  {deposit.status}
                                </span>
                              </td>
                              <td className="py-2 text-center text-textCustom/70 whitespace-nowrap">{fmtDate(deposit.created_at)}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="py-4 text-center text-textCustom/40 italic">No deposits found</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* ── MOBILE SCREEN RESOLUTIONS: Fluid Stacked Data Cards ── */}
                  <div className="block md:hidden">
                    {selectedUser.deposits && selectedUser.deposits.length > 0 ? (
                      <div className="grid grid-cols-1 gap-3">
                        {selectedUser.deposits.map((deposit: any) => (
                          <div key={deposit.deposit_id} className="bg-surface2 border border-borderCustom/60 p-4 rounded-xl space-y-2.5">
                            <div className="flex justify-between items-center">
                              <span className="text-textCustom font-mono font-semibold">#{deposit.deposit_id}</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${deposit.status === 'approved' ? 'bg-[#10b981]/15 text-[#10b981]' :
                                  deposit.status === 'rejected' ? 'bg-[#ef4444]/15 text-[#ef4444]' :
                                    'bg-[#f59e0b]/15 text-[#f59e0b]'
                                }`}>
                                {deposit.status}
                              </span>
                            </div>

                            <div className="flex justify-between items-center text-xs pt-1 border-t border-borderCustom/40">
                              <div>
                                <span className="text-textCustom/40 text-[10px] block uppercase font-bold tracking-wide">PKR Sent</span>
                                <span className="text-textCustom font-medium">PKR {Number(deposit.amount_pkr).toLocaleString()}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-textCustom/40 text-[10px] block uppercase font-bold tracking-wide">SAR Value</span>
                                <span className="text-[#10b981] font-bold text-sm">{fmtRiyal(deposit.amount_riyal)}</span>
                              </div>
                            </div>

                            <div className="flex justify-between items-center text-xs pt-1">
                              <div>
                                <span className="text-textCustom/40 text-[10px] block uppercase font-bold tracking-wide">Date</span>
                                <span className="text-textCustom/60 text-[11px] whitespace-nowrap">{fmtDate(deposit.created_at)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-xs text-textCustom/40 bg-surface2/40 border border-dashed border-borderCustom rounded-xl italic">
                        No deposits found
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Wins */}
                <div>
                  <h4 className="text-sm font-bold text-textCustom mb-3">Recent Wins (Last 20)</h4>

                  {/* ── DESKTOP SCREEN RESOLUTIONS: Perfectly Centered Grid Table ── */}
                  <div className="hidden md:block overflow-x-auto scrollbar-none">
                                        <table className="w-full border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-borderCustom">
                          {/* Changed all column header placements to explicit center layouts */}
                          <th className="text-center pb-2 text-[11px] font-semibold text-textCustom/60">ID</th>
                          <th className="text-center pb-2 text-[11px] font-semibold text-textCustom/60">Numbers</th>
                          <th className="text-center pb-2 text-[11px] font-semibold text-textCustom/60">Type</th>
                          <th className="text-center pb-2 text-[11px] font-semibold text-textCustom/60">Prize</th>
                          <th className="text-center pb-2 text-[11px] font-semibold text-textCustom/60">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-borderCustom/40">
                        {selectedUser.wins && selectedUser.wins.length > 0 ? (
                          selectedUser.wins.map((win: any) => {
                            // 🟢 FIXED: Create a local DD/MM/YYYY date formatter for the table cell
                            const d = new Date(win.announced_date);
                            const day = String(d.getDate()).padStart(2, '0');
                            const month = String(d.getMonth() + 1).padStart(2, '0'); // Months start at 0
                            const year = d.getFullYear();
                            const formattedDmyDate = isNaN(d.getTime()) ? '—' : `${day}/${month}/${year}`;

                            return (
                              <tr key={win.winner_id} className="hover:bg-surface2/30 transition-colors text-center">
                                {/* Centered all corresponding data items cleanly across rows */}
                                <td className="py-2 text-center text-textCustom font-mono">#{win.winner_id}</td>
                                <td className="py-2 text-center text-[#f59e0b] font-bold tracking-wider">{win.w1} - {win.w2} - {win.w3}</td>
                                <td className="py-2 text-center text-textCustom capitalize">{win.ticket_type}</td>
                                <td className="py-2 text-center text-[#10b981] font-bold">{fmtRiyal(win.prize_amount)}</td>
                                {/* 🟢 FIXED: Renders the cleaned up custom text output string directly here */}
                                <td className="py-2 text-center text-textCustom/70 whitespace-nowrap">{formattedDmyDate}</td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={5} className="py-4 text-center text-textCustom/40 italic">No wins found</td>
                          </tr>
                        )}
                      </tbody>
                    </table>

                  </div>

                  {/* ── MOBILE SCREEN RESOLUTIONS: Beautifully Stacked Details Cards ── */}
                  <div className="block md:hidden">
                    {selectedUser.wins && selectedUser.wins.length > 0 ? (
                      <div className="grid grid-cols-1 gap-3">
                        {selectedUser.wins.map((win: any) => (
                          <div key={win.winner_id} className="bg-surface2 border border-borderCustom/60 p-4 rounded-xl space-y-2.5">
                            <div className="flex justify-between items-center">
                              <span className="text-textCustom font-mono font-semibold">#{win.winner_id}</span>
                              <span className="bg-[#10b981]/15 text-[#10b981] px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                                Winner
                              </span>
                            </div>

                            <div className="flex justify-between items-center text-xs pt-1 border-t border-borderCustom/40">
                              <div>
                                <span className="text-textCustom/40 text-[10px] block uppercase font-bold tracking-wide">Draw Numbers</span>
                                <span className="text-[#f59e0b] font-bold text-sm tracking-wider">{win.w1} - {win.w2} - {win.w3}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-textCustom/40 text-[10px] block uppercase font-bold tracking-wide">Prize Awarded</span>
                                <span className="text-[#10b981] font-bold text-sm">{fmtRiyal(win.prize_amount)}</span>
                              </div>
                            </div>

                            <div className="flex justify-between items-center text-xs pt-1">
                              <div>
                                <span className="text-textCustom/40 text-[10px] block uppercase font-bold tracking-wide">Ticket Type</span>
                                <span className="text-textCustom capitalize font-medium">{win.ticket_type}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-textCustom/40 text-[10px] block uppercase font-bold tracking-wide">Announced</span>
                                <span className="text-textCustom/60 text-[11px] whitespace-nowrap">{fmtDate(win.announced_date)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-xs text-textCustom/40 bg-surface2/40 border border-dashed border-borderCustom rounded-xl italic">
                        No wins found
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
